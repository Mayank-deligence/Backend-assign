const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('../models/User');
const Topic = require('../models/Topic');
const Progress = require('../models/Progress');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// auth middleware reads x-auth-token or Authorization Bearer
const auth = (req, res, next) => {
  const token = req.header('x-auth-token') || (req.header('authorization') && req.header('authorization').split(' ')[1]);
  console.log('AUTH HEADER x-auth-token:', req.header('x-auth-token'), ' authorization:', req.header('authorization')); // debug
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('decoded token id:', decoded?.id); // debug
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error('JWT verify error:', err.message); // debug
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Simple login (creates user if not present). Returns { token }
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ msg: 'Missing credentials' });

  let user = await User.findOne({ email });
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    user = new User({ email, password: hashed });
    await user.save();
  } else {
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ msg: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// GET /auth/me - get logged-in user's details
router.get('/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ✅ GET /topics - returns topics, seeds sample if none
router.get('/topics', async (req, res) => {
  try {
    // 1️⃣ Check if topics already exist
    let topics = await Topic.find({});

    // 2️⃣ If none exist, seed sample topics
    if (topics.length === 0) {
      await Topic.create([
        {
          title: 'Arrays',
          description: 'Basic and intermediate array problems',
          problems: [
            {
              title: 'Two Sum',
              level: 'Easy',
              leetcodeLink: 'https://leetcode.com/problems/two-sum',
              youtubeLink: 'https://www.youtube.com/watch?v=KLlXCFG5TnA',
              articleLink: 'https://leetcode.com/problems/two-sum/solutions/127810/two-sum-python-solutions/'
            },
            {
              title: 'Best Time to Buy and Sell Stock',
              level: 'Easy',
              leetcodeLink: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock',
              youtubeLink: 'https://www.youtube.com/watch?v=1pkOgXD63yU',
              articleLink: 'https://takeuforward.org/data-structure/stock-buy-and-sell/'
            },
            {
              title: 'Maximum Subarray',
              level: 'Medium',
              leetcodeLink: 'https://leetcode.com/problems/maximum-subarray',
              youtubeLink: 'https://www.youtube.com/watch?v=5WZl3MMT0Eg',
              articleLink: 'https://leetcode.com/problems/maximum-subarray/solutions/1595195/kadane-s-algorithm-dp-solution/'
            }
          ]
        },
        {
          title: 'Strings',
          description: 'String manipulation and pattern matching problems',
          problems: [
            {
              title: 'Valid Anagram',
              level: 'Easy',
              leetcodeLink: 'https://leetcode.com/problems/valid-anagram',
              youtubeLink: 'https://www.youtube.com/watch?v=9UtInBqnCgA',
              articleLink: 'https://takeuforward.org/data-structure/check-if-two-strings-are-anagram-of-each-other/'
            },
            {
              title: 'Longest Substring Without Repeating Characters',
              level: 'Medium',
              leetcodeLink: 'https://leetcode.com/problems/longest-substring-without-repeating-characters',
              youtubeLink: 'https://www.youtube.com/watch?v=wiGpQwVHdE0',
              articleLink: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/solutions/127598/official-solution/'
            }
          ]
        },
        {
          title: 'Linked Lists',
          description: 'Fundamentals of linked lists and pointer manipulation',
          problems: [
            {
              title: 'Reverse Linked List',
              level: 'Easy',
              leetcodeLink: 'https://leetcode.com/problems/reverse-linked-list',
              youtubeLink: 'https://www.youtube.com/watch?v=G0_I-ZF0S38',
              articleLink: 'https://takeuforward.org/data-structure/reverse-a-linked-list/'
            },
            {
              title: 'Merge Two Sorted Lists',
              level: 'Easy',
              leetcodeLink: 'https://leetcode.com/problems/merge-two-sorted-lists',
              youtubeLink: 'https://www.youtube.com/watch?v=XIdigk956u0',
              articleLink: 'https://leetcode.com/problems/merge-two-sorted-lists/solutions/9784/python-solutions-iterative-recursive/'
            }
          ]
        },
        {
          title: 'Graphs',
          description: 'Graph traversal, connectivity, and shortest paths',
          problems: [
            {
              title: 'Number of Islands',
              level: 'Medium',
              leetcodeLink: 'https://leetcode.com/problems/number-of-islands',
              youtubeLink: 'https://www.youtube.com/watch?v=pV2kpPD66nE',
              articleLink: 'https://takeuforward.org/graph/number-of-islands-using-bfs-dfs/'
            },
            {
              title: 'Course Schedule',
              level: 'Medium',
              leetcodeLink: 'https://leetcode.com/problems/course-schedule',
              youtubeLink: 'https://www.youtube.com/watch?v=EgI5nU9etnU',
              articleLink: 'https://leetcode.com/problems/course-schedule/solutions/1203071/course-schedule-topological-sort-bfs-dfs/'
            }
          ]
        },
        {
          title: 'Dynamic Programming',
          description: 'Classic DP patterns and subproblem optimization',
          problems: [
            {
              title: 'Climbing Stairs',
              level: 'Easy',
              leetcodeLink: 'https://leetcode.com/problems/climbing-stairs',
              youtubeLink: 'https://www.youtube.com/watch?v=Y0lT9Fck7qI',
              articleLink: 'https://takeuforward.org/data-structure/dynamic-programming-introduction/'
            },
            {
              title: 'Longest Increasing Subsequence',
              level: 'Medium',
              leetcodeLink: 'https://leetcode.com/problems/longest-increasing-subsequence',
              youtubeLink: 'https://www.youtube.com/watch?v=6L0Vl3YeB7w',
              articleLink: 'https://takeuforward.org/dynamic-programming/longest-increasing-subsequence-dp-41/'
            }
          ]
        },
        {
          title: 'Trees',
          description: 'Binary tree and BST-based questions',
          problems: [
            {
              title: 'Maximum Depth of Binary Tree',
              level: 'Easy',
              leetcodeLink: 'https://leetcode.com/problems/maximum-depth-of-binary-tree',
              youtubeLink: 'https://www.youtube.com/watch?v=hTM3phVI6YQ',
              articleLink: 'https://takeuforward.org/data-structure/maximum-depth-of-a-binary-tree/'
            },
            {
              title: 'Lowest Common Ancestor of a Binary Tree',
              level: 'Medium',
              leetcodeLink: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree',
              youtubeLink: 'https://www.youtube.com/watch?v=KobQcxdaZKY',
              articleLink: 'https://takeuforward.org/data-structure/lowest-common-ancestor-for-two-given-nodes-in-binary-tree/'
            }
          ]
        }
      ]);

      // Re-fetch all topics after seeding
      topics = await Topic.find({});
    }

    // 3️⃣ Return final topics list
    res.status(200).json(topics);
  } catch (err) {
    console.error('Error fetching topics:', err);
    res.status(500).json({ msg: 'Server error while fetching topics' });
  }
});

// router.get('/topics/reset', async (req, res) => {
//   try {
//     await Topic.deleteMany({});
//     await Topic.create([
//         {
//           title: 'Arrays',
//           description: 'Basic and intermediate array problems',
//           problems: [
//             {
//               title: 'Two Sum',
//               level: 'Easy',
//               leetcodeLink: 'https://leetcode.com/problems/two-sum',
//               youtubeLink: 'https://www.youtube.com/watch?v=KLlXCFG5TnA',
//               articleLink: 'https://leetcode.com/problems/two-sum/solutions/127810/two-sum-python-solutions/'
//             },
//             {
//               title: 'Best Time to Buy and Sell Stock',
//               level: 'Easy',
//               leetcodeLink: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock',
//               youtubeLink: 'https://www.youtube.com/watch?v=1pkOgXD63yU',
//               articleLink: 'https://takeuforward.org/data-structure/stock-buy-and-sell/'
//             },
//             {
//               title: 'Maximum Subarray',
//               level: 'Medium',
//               leetcodeLink: 'https://leetcode.com/problems/maximum-subarray',
//               youtubeLink: 'https://www.youtube.com/watch?v=5WZl3MMT0Eg',
//               articleLink: 'https://leetcode.com/problems/maximum-subarray/solutions/1595195/kadane-s-algorithm-dp-solution/'
//             }
//           ]
//         },
//         {
//           title: 'Strings',
//           description: 'String manipulation and pattern matching problems',
//           problems: [
//             {
//               title: 'Valid Anagram',
//               level: 'Easy',
//               leetcodeLink: 'https://leetcode.com/problems/valid-anagram',
//               youtubeLink: 'https://www.youtube.com/watch?v=9UtInBqnCgA',
//               articleLink: 'https://takeuforward.org/data-structure/check-if-two-strings-are-anagram-of-each-other/'
//             },
//             {
//               title: 'Longest Substring Without Repeating Characters',
//               level: 'Medium',
//               leetcodeLink: 'https://leetcode.com/problems/longest-substring-without-repeating-characters',
//               youtubeLink: 'https://www.youtube.com/watch?v=wiGpQwVHdE0',
//               articleLink: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/solutions/127598/official-solution/'
//             }
//           ]
//         },
//         {
//           title: 'Linked Lists',
//           description: 'Fundamentals of linked lists and pointer manipulation',
//           problems: [
//             {
//               title: 'Reverse Linked List',
//               level: 'Easy',
//               leetcodeLink: 'https://leetcode.com/problems/reverse-linked-list',
//               youtubeLink: 'https://www.youtube.com/watch?v=G0_I-ZF0S38',
//               articleLink: 'https://takeuforward.org/data-structure/reverse-a-linked-list/'
//             },
//             {
//               title: 'Merge Two Sorted Lists',
//               level: 'Easy',
//               leetcodeLink: 'https://leetcode.com/problems/merge-two-sorted-lists',
//               youtubeLink: 'https://www.youtube.com/watch?v=XIdigk956u0',
//               articleLink: 'https://leetcode.com/problems/merge-two-sorted-lists/solutions/9784/python-solutions-iterative-recursive/'
//             }
//           ]
//         },
//         {
//           title: 'Graphs',
//           description: 'Graph traversal, connectivity, and shortest paths',
//           problems: [
//             {
//               title: 'Number of Islands',
//               level: 'Medium',
//               leetcodeLink: 'https://leetcode.com/problems/number-of-islands',
//               youtubeLink: 'https://www.youtube.com/watch?v=pV2kpPD66nE',
//               articleLink: 'https://takeuforward.org/graph/number-of-islands-using-bfs-dfs/'
//             },
//             {
//               title: 'Course Schedule',
//               level: 'Medium',
//               leetcodeLink: 'https://leetcode.com/problems/course-schedule',
//               youtubeLink: 'https://www.youtube.com/watch?v=EgI5nU9etnU',
//               articleLink: 'https://leetcode.com/problems/course-schedule/solutions/1203071/course-schedule-topological-sort-bfs-dfs/'
//             }
//           ]
//         },
//         {
//           title: 'Dynamic Programming',
//           description: 'Classic DP patterns and subproblem optimization',
//           problems: [
//             {
//               title: 'Climbing Stairs',
//               level: 'Easy',
//               leetcodeLink: 'https://leetcode.com/problems/climbing-stairs',
//               youtubeLink: 'https://www.youtube.com/watch?v=Y0lT9Fck7qI',
//               articleLink: 'https://takeuforward.org/data-structure/dynamic-programming-introduction/'
//             },
//             {
//               title: 'Longest Increasing Subsequence',
//               level: 'Medium',
//               leetcodeLink: 'https://leetcode.com/problems/longest-increasing-subsequence',
//               youtubeLink: 'https://www.youtube.com/watch?v=6L0Vl3YeB7w',
//               articleLink: 'https://takeuforward.org/dynamic-programming/longest-increasing-subsequence-dp-41/'
//             }
//           ]
//         },
//         {
//           title: 'Trees',
//           description: 'Binary tree and BST-based questions',
//           problems: [
//             {
//               title: 'Maximum Depth of Binary Tree',
//               level: 'Easy',
//               leetcodeLink: 'https://leetcode.com/problems/maximum-depth-of-binary-tree',
//               youtubeLink: 'https://www.youtube.com/watch?v=hTM3phVI6YQ',
//               articleLink: 'https://takeuforward.org/data-structure/maximum-depth-of-a-binary-tree/'
//             },
//             {
//               title: 'Lowest Common Ancestor of a Binary Tree',
//               level: 'Medium',
//               leetcodeLink: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree',
//               youtubeLink: 'https://www.youtube.com/watch?v=KobQcxdaZKY',
//               articleLink: 'https://takeuforward.org/data-structure/lowest-common-ancestor-for-two-given-nodes-in-binary-tree/'
//             }
//           ]
//         }
//       ]);
//     const topics = await Topic.find({});
//     res.status(200).json({ msg: 'Topics reset successfully', topics });
//   } catch (err) {
//     console.error('Error resetting topics:', err);
//     res.status(500).json({ msg: 'Server error while resetting topics' });
//   }
// });


// GET /progress - returns progress for current user with problem objects attached
router.get('/progress', auth, async (req, res) => {
  const userId = req.userId;
  const progress = await Progress.find({ userId }).lean();
  const topics = await Topic.find({}).lean();

  // Attach problem object where possible
  const mapped = progress.map(p => {
    let prob = null;
    for (const t of topics) {
      const found = (t.problems || []).find(pr => pr._id?.toString() === p.problemId?.toString());
      if (found) { prob = found; break; }
    }
    return { ...p, problemId: prob || p.problemId };
  });

  res.json(mapped);
});

// POST /progress - create or update progress (body: { problemId, completed })
router.post('/progress', auth, async (req, res) => {
  const userId = req.userId;
  const { problemId, completed } = req.body;
  if (!problemId) return res.status(400).json({ msg: 'problemId required' });

  const existing = await Progress.findOne({ userId, problemId });
  if (existing) {
    existing.completed = !!completed;
    await existing.save();
    return res.json(existing);
  }
  const newP = new Progress({ userId, problemId, completed: !!completed });
  await newP.save();
  res.json(newP);
});

// ✅ NEW ROUTE: GET /progress/summary - returns percentage summary for easy/medium/hard
router.get('/progress/summary', auth, async (req, res) => {
  const userId = req.userId;

  try {
    const topics = await Topic.find({}).lean();
    const allProblems = topics.flatMap(t => t.problems || []);
    const progress = await Progress.find({ userId, completed: true }).lean();

    const total = { easy: 0, medium: 0, hard: 0 };
    const done = { easy: 0, medium: 0, hard: 0 };

    allProblems.forEach(p => {
      const level = (p.level || '').toLowerCase();
      if (level.includes('easy')) total.easy++;
      else if (level.includes('medium')) total.medium++;
      else if (level.includes('hard') || level.includes('tough')) total.hard++;

      const isCompleted = progress.some(pr => pr.problemId?.toString() === p._id?.toString());
      if (isCompleted) {
        if (level.includes('easy')) done.easy++;
        else if (level.includes('medium')) done.medium++;
        else if (level.includes('hard') || level.includes('tough')) done.hard++;
      }
    });

    const pct = {
      easy: total.easy ? Math.round((done.easy / total.easy) * 100) : 0,
      medium: total.medium ? Math.round((done.medium / total.medium) * 100) : 0,
      hard: total.hard ? Math.round((done.hard / total.hard) * 100) : 0,
    };

    res.json(pct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Simple health route
router.get('/', (req, res) => res.send('Backend API is running'));

module.exports = router;