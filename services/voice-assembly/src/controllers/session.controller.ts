import { Request, Response } from 'express';
import { TownHallSession } from '@nexus-civic/db';
import { createSessionRoom, syncVoteUpdate } from '../utils/spacetimedb';
import { transcribeAudio } from '../utils/elevenlabs';
import logger from '../utils/logger';
import { createGeminiClient } from '@nexus-civic/gemini-client';

const VotedCache = new Map<string, Set<string>>(); // memory cache: issueId -> Set of userIds

export const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, scheduledAt } = req.body;
    
    // Auth is handled by requireAdmin which allows 'admin' or 'GOVERNMENT'
    const adminId = (req as any).user.id;

    const session = new TownHallSession({
      title,
      scheduledAt: new Date(scheduledAt),
      adminId,
      status: 'UPCOMING',
      issues: [],
      participantCount: 0,
    });

    await session.save();

    await createSessionRoom(session._id.toString());
    
    res.status(201).json(session);
  } catch (error) {
    logger.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

export const listSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const sessions = await TownHallSession.find(filter).sort({ scheduledAt: 1 }).select('-issues');
    res.status(200).json(sessions);
  } catch (error) {
    logger.error('Error listing sessions:', error);
    res.status(500).json({ error: 'Failed to list sessions' });
  }
};

export const getSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await TownHallSession.findById(req.params.id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.status(200).json(session);
  } catch (error) {
    logger.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
};

export const joinSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await TownHallSession.findById(req.params.id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    session.participantCount += 1;
    await session.save();

    res.status(200).json({ message: 'Joined session successfully' });
  } catch (error) {
    logger.error('Error joining session:', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
};

export const submitIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { audioBase64, text } = req.body;
    let finalTranscript = text;

    if (audioBase64) {
      const result = await transcribeAudio(audioBase64);
      finalTranscript = result.transcript;
    }

    if (!finalTranscript) {
      res.status(400).json({ error: 'Either text or audioBase64 must be provided' });
      return;
    }

    // Deduplication via Gemini
    try {
      const gemini = createGeminiClient(process.env.GEMINI_API_KEY || '');
      const dedupPrompt = `Analyze the following issue and rephrase it into a clear, concise sentence for a town hall meeting. Ignore conversational filler.\nIssue: ${finalTranscript}`;
      const aiResponse = await gemini.answerQuestion(dedupPrompt, "Provide only a single rephrased sentence.");
      if (aiResponse && aiResponse !== 'Unable to answer at this time. Please check back later.') {
        finalTranscript = aiResponse;
      }
    } catch (aiError) {
      logger.warn('Gemini deduplication failed, using raw transcript', aiError);
    }

    const session = await TownHallSession.findById(req.params.id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const newIssue = {
      text: finalTranscript,
      authorId: (req as any).user.id,
      voteCount: 0,
      status: 'OPEN',
    };

    // @ts-ignore
    session.issues.push(newIssue);
    await session.save();

    const savedIssue = session.issues[session.issues.length - 1];

    res.status(201).json(savedIssue);
  } catch (error) {
    logger.error('Error submitting issue:', error);
    res.status(500).json({ error: 'Failed to submit issue' });
  }
};

export const castVote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { issueId } = req.body;
    const userId = (req as any).user.id;

    if (!VotedCache.has(issueId)) {
      VotedCache.set(issueId, new Set<string>());
    }

    const userVotes = VotedCache.get(issueId)!;
    if (userVotes.has(userId)) {
      res.status(400).json({ error: 'User has already voted for this issue' });
      return;
    }

    const session = await TownHallSession.findById(req.params.id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // @ts-ignore
    const issue = session.issues.id(issueId);
    if (!issue) {
      res.status(404).json({ error: 'Issue not found' });
      return;
    }

    issue.voteCount += 1;
    userVotes.add(userId);
    await session.save();

    await syncVoteUpdate(session._id.toString(), issueId, issue.voteCount);

    res.status(200).json({ message: 'Vote cast successfully', count: issue.voteCount });
  } catch (error) {
    logger.error('Error casting vote:', error);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
};
