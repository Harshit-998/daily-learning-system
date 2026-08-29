import type { GeneratedLesson, LessonSelection } from "../types.js";

export function fallbackLesson(selection: LessonSelection): GeneratedLesson {
  const topic = selection.systemDesignTopic;
  const pattern = selection.dsaPattern;
  const weekly = selection.mode === "weekly-review";

  return {
    title: weekly ? `Sunday Mastery: ${topic.title} + ${pattern.title}` : `${topic.title} + ${pattern.title}`,
    date: selection.date,
    mode: selection.mode,
    recall: [
      "Latency is how long one request takes; throughput is how many requests finish per unit time; availability is whether the system responds correctly at all.",
      "Little's Law connects them: L = lambda x W, so in-flight work equals arrival rate times latency.",
      "Advanced hashing is about inventing the right key: prefix sum counts, boundary membership, or frequency signatures."
    ],
    systemDesign: {
      topicId: topic.id,
      topic: topic.title,
      simpleConcept: "Latency measures how long one request takes. Throughput measures how many requests complete per unit time. Availability measures whether the system can return correct responses over time.",
      whyItExists: "These three metrics exist because a system can fail users in different ways: it can be slow, unable to process enough work, or down. Strong designs keep those dimensions separate before choosing caches, queues, replicas, or failover.",
      analogy: "Use a highway. Latency is how long your car takes from on-ramp to off-ramp. Throughput is how many cars pass a checkpoint per hour. Availability is whether the highway is open. A jammed highway can be available but painful; an empty highway can be low latency but low total throughput.",
      technicalDepth: "The connective formula is Little's Law: L = lambda x W. L is concurrent in-flight work, lambda is arrival rate, and W is average time in the system. If requests arrive at 1,000 per second and average latency is 200 ms, roughly 200 requests are in flight. If latency triples while arrival rate stays fixed, in-flight work triples too, exhausting threads, sockets, DB connections, and queues. This is why p95 and p99 matter more than averages in design interviews.",
      diagram: latencyThroughputSvg(),
      diagramCaption: "Reads that users wait on should stay latency-bound, often through cache. Writes that can tolerate delay can move through a queue to optimize throughput and absorb bursts.",
      realWorldExample: "A YouTube home feed read path may serve cached recommendations quickly, while watch-history updates can be written asynchronously. The user sees a fast page, and the system still records durable activity without blocking the visible path.",
      practicalDesignExample: "For a notification system, accept the request quickly, validate it, store a send intent, enqueue delivery work, let workers call channel providers, and record delivery status. The API path is optimized for user latency; the worker path is optimized for throughput and retry safety.",
      componentInteraction: "Client requests enter the edge/API layer for authentication and rate limiting, then reach an application service. Read-heavy requests check cache before the primary database. Write-heavy or slow downstream work is placed on a queue. Workers drain the queue, update durable storage, and emit metrics for latency percentiles, queue depth, error rate, and saturation.",
      tradeOffs: ["Caching can reduce read latency but introduces staleness and invalidation complexity.", "Queues improve throughput and burst handling but introduce delayed completion and duplicate-processing risk.", "Higher availability usually requires redundancy, failover, and operational work that increase system complexity."],
      whenToUse: ["Use latency optimization when users are synchronously waiting for the answer.", "Use throughput optimization when the system must process large volumes reliably.", "Use availability patterns when downtime has meaningful user, revenue, or safety impact."],
      whenNotToUse: ["Do not add queues if the caller truly needs the final result immediately.", "Do not add caches before measuring that reads are actually bottlenecked by repeated expensive work.", "Do not chase five nines for a prototype or low-impact internal tool."],
      commonMistakes: ["Reporting average latency instead of p95 or p99.", "Saying a system is available while returning stale, incorrect, or timed-out responses.", "Adding a queue and forgetting idempotency, retries, dead letters, and backlog alarms."],
      scalingConsiderations: ["Estimate arrival rate as volume divided by time before sizing instances or queues.", "Use Little's Law to estimate concurrency pressure on pools and downstream systems.", "Track p50, p95, p99, queue depth, worker lag, saturation, and error budget burn."],
      failureScenarios: ["A downstream timeout increases latency, which increases in-flight requests, which causes more timeouts.", "A queue hides overload until lag grows beyond the business SLA.", "A cache outage sends all reads to the database and creates a sudden throughput cliff."],
      productionUsage: "Production teams set service-level objectives around latency percentiles and availability, capacity-test throughput, and alert on both user-visible symptoms and leading indicators like queue depth, connection pool exhaustion, and retry spikes.",
      interviewQuestions: ["Walk through what happens if p99 latency triples under load.", "How would you size a connection pool given expected RPS and average latency?", "What metrics prove your queue is keeping up rather than hiding a backlog?", "Which would you sacrifice first in payments versus a social feed: latency, throughput, or availability?"],
      previousConceptConnections: topic.prerequisites.length > 0 ? `This builds on ${topic.prerequisites.join(", ")}.` : "This is a foundation for later topics such as caching, load balancing, queues, and consistency.",
      thinkLikeEngineerQuestions: ["What breaks first if traffic becomes 10x?", "Which requests are users staring at, and which can finish later?", "How would you detect rising latency before users report an outage?"],
      mnemonic: {
        label: "lambda W",
        text: "If work takes longer, more requests wait in flight. First compute rate as volume divided by time, then use L = lambda x W to size queues, pools, and instance counts."
      }
    },
    dsa: {
      patternId: pattern.id,
      pattern: pattern.title,
      problemStatement: "Given a sequence, identify whether a hard-looking condition can be turned into a stable hash key: a prefix sum, a boundary value, a frequency signature, or a canonical representation.",
      examples: ["Subarray Sum Equals K: nums = [1,2,3], k = 3; Output: 2 because [1,2] and [3] both work.", "Longest Consecutive Sequence: nums = [100,4,200,1,3,2]; Output: 4 for [1,2,3,4].", "Group Anagrams with count keys: words with the same 26-count signature belong together without sorting each string."],
      constraints: ["Aim for better than O(n^2) when the pattern allows it.", "Use Java standard library data structures unless the problem forbids them.", "Handle empty input, duplicates, and boundary values deliberately."],
      whatToNotice: ["The input order usually matters less than membership, frequency, or a canonical representation.", "The question often contains words like pair, duplicate, group, frequency, seen before, or complement.", "Each new element asks a hash structure one O(1)-style question."],
      bruteForce: "Try every candidate combination and check whether it satisfies the condition. This is useful for understanding correctness but often repeats work.",
      whyInsufficient: "Brute force is usually O(n^2) because every item is compared with many previous or future items. Hashing keeps a compact memory of useful information so each item can be processed once.",
      coreIntuition: "The trick is not HashMap syntax; it is inventing the key that makes old work reusable. Prefix sums turn subarray sums into complement lookups. Sets turn consecutive ranges into boundary starts. Frequency vectors turn anagrams into deterministic buckets.",
      optimalApproach: "Name the invariant, derive the key, and prove why looking up that key represents all earlier candidates without scanning them again.",
      stepByStep: ["State the hidden transformation: sum(i..j) becomes prefix[j] - prefix[i - 1].", "Choose a map or set based on whether you need counts, existence, or grouped output.", "Update the answer using the old state before mutating state when ordering matters.", "For range problems, only start work at canonical boundaries to get amortized O(n).", "Test negative numbers, duplicates, empty groups, and cases where sorting would hide a better key."],
      javaCode: `import java.util.*;

class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> prefixCount = new HashMap<>();
        prefixCount.put(0, 1);
        int prefix = 0;
        int answer = 0;
        for (int n : nums) {
            prefix += n;
            answer += prefixCount.getOrDefault(prefix - k, 0);
            prefixCount.put(prefix, prefixCount.getOrDefault(prefix, 0) + 1);
        }
        return answer;
    }

    public int longestConsecutive(int[] nums) {
        Set<Integer> values = new HashSet<>();
        for (int n : nums) {
            values.add(n);
        }
        int best = 0;
        for (int n : values) {
            if (!values.contains(n - 1)) {
                int current = n;
                while (values.contains(current)) current++;
                best = Math.max(best, current - n);
            }
        }
        return best;
    }

    public List<List<String>> groupAnagramsByCount(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String word : strs) {
            int[] count = new int[26];
            for (char c : word.toCharArray()) count[c - 'a']++;
            String key = Arrays.toString(count);
            groups.computeIfAbsent(key, ignored -> new ArrayList<>()).add(word);
        }
        return new ArrayList<>(groups.values());
    }
}`,
      complexities: "Subarray Sum Equals K is O(n) time and O(n) space. Longest Consecutive is amortized O(n) time and O(n) space because each range is expanded from only its start. Count-key anagrams are O(n * k) time and O(n * k) space.",
      mistakes: ["Using sliding window for subarray sum when negatives are allowed.", "Expanding every number in Longest Consecutive instead of only sequence starts.", "Sorting anagram strings by habit when a frequency key gives a cleaner O(k) key for fixed alphabets."],
      recognitionClues: ["Subarray plus target sum plus negative numbers often points to prefix sum counts.", "Longest consecutive or range stitching often points to hash-set boundary starts.", "Group by same multiset of characters points to a frequency signature key."],
      variations: pattern.sampleProblems,
      relatedProblems: pattern.sampleProblems.slice(0, 3),
      exactlyWhatChangesAcrossVariants: ["Subarray Sum stores prefix sum -> count because multiple earlier prefixes may create valid subarrays.", "Longest Consecutive stores membership and only expands from boundary starts.", "Group Anagrams stores frequency signature -> list because the answer is grouped output."],
      invariant: "Invent the key that collapses many previous candidates into one lookup, then prove that key preserves exactly the information the answer needs.",
      trace: {
        title: "Prefix-sum trace: nums = [1, 2, 3], k = 3",
        steps: ["Start with prefixCount[0] = 1 so subarrays beginning at index 0 are counted.", "After 1: prefix = 1, need -2, answer stays 0, store prefix 1.", "After 2: prefix = 3, need 0, answer becomes 1 for [1,2], store prefix 3.", "After 3: prefix = 6, need 3, answer becomes 2 for [3], store prefix 6."],
        cells: [
          { index: 0, value: "1", highlight: true },
          { index: 1, value: "2", highlight: true },
          { index: 2, value: "3", highlight: true }
        ]
      },
      mnemonic: {
        label: "K.I.P.",
        text: "Key, invariant, proof. If you cannot name the key and prove what it preserves, you are probably just using a map by reflex."
      },
      variantWalkthroughs: [
        {
          name: "Subarray Sum Equals K",
          whatChanges: "Store prefix sum to count, because every previous prefix equal to currentPrefix - k creates one valid subarray.",
          code: "Map<Integer, Integer> count = new HashMap<>();\ncount.put(0, 1);\nint prefix = 0, answer = 0;\nfor (int n : nums) {\n    prefix += n;\n    answer += count.getOrDefault(prefix - k, 0);\n    count.put(prefix, count.getOrDefault(prefix, 0) + 1);\n}",
          complexity: "O(n) time, O(n) space."
        },
        {
          name: "Longest Consecutive Sequence",
          whatChanges: "Store membership, but only expand when n - 1 is absent. That boundary test prevents repeated range work.",
          code: "Set<Integer> values = new HashSet<>();\nfor (int n : nums) values.add(n);\nint best = 0;\nfor (int n : values) {\n    if (!values.contains(n - 1)) {\n        int cur = n;\n        while (values.contains(cur)) cur++;\n        best = Math.max(best, cur - n);\n    }\n}",
          complexity: "Amortized O(n) time, O(n) space."
        },
        {
          name: "Group Anagrams with Frequency Keys",
          whatChanges: "Store character-count signature to list. Same letters with different order collapse into the same key without sorting.",
          code: "Map<String, List<String>> groups = new HashMap<>();\nfor (String word : strs) {\n    int[] count = new int[26];\n    for (char c : word.toCharArray()) count[c - 'a']++;\n    String key = Arrays.toString(count);\n    groups.computeIfAbsent(key, ignored -> new ArrayList<>()).add(word);\n}",
          complexity: "O(n * k) time for fixed alphabet, O(n * k) space."
        }
      ],
      transferLearning: "If you understand this family, you should now recognize prefix-count problems, range-boundary problems, and canonical-grouping problems. What remains the same is collapsing repeated candidate checks into one key lookup. What changes is whether the key stores count, existence, or grouped payload. The intuition still works when the key preserves all answer-relevant history; it stops working when order, adjacency, monotonicity, or global optimization cannot be encoded in that key."
    },
    selfTest: [
      { question: "What single formula connects latency, throughput, and concurrency?", answer: "Little's Law: L = lambda x W. In-flight requests equal arrival rate times average latency." },
      { question: "p99 latency triples while arrival rate stays constant. What happens to in-flight requests?", answer: "They roughly triple, which can exhaust thread pools, connection pools, and queues." },
      { question: "Why is average latency misleading in interviews?", answer: "It hides the long tail. p95 and p99 describe the users most likely to experience timeouts." },
      { question: "Why does Subarray Sum Equals K need prefix counts rather than a set?", answer: "Because multiple earlier prefixes can create multiple valid subarrays ending at the same index." },
      { question: "What is the shared invariant across advanced hashing problems?", answer: "Design a key that preserves exactly the useful history, then use one lookup instead of scanning old candidates." }
    ],
    qualityReview: {
      passed: true,
      notes: ["Local fallback lesson contains every required section, retention mechanics, rendered SVG, and DSA variant walkthroughs."]
    },
    telegramSummary: `${weekly ? "Sunday mastery" : "Daily lesson"}: ${topic.title} + ${pattern.title}\n\nSystem Design: Little's Law is L = lambda x W. If latency rises at the same arrival rate, in-flight requests rise too.\n\nDSA: ${pattern.title} = invent the key that preserves useful history. Prefix sum counts, boundary sets, and frequency signatures are three high-density variants.\n\nRecall: explain the read-cache vs write-queue split, then trace prefix sum counts once.`
  };
}

function latencyThroughputSvg(): string {
  return `<svg viewBox="0 0 900 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Architecture diagram showing latency-bound reads and throughput-bound writes">
  <defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#7fd6c6"/></marker></defs>
  <text x="20" y="24" fill="#7fd6c6" font-family="monospace" font-size="11">REQUEST PATH: LATENCY VS THROUGHPUT</text>
  <g font-family="monospace" font-size="12" fill="#eaf6f2">
    <rect x="20" y="60" width="110" height="46" rx="4" fill="none" stroke="#7fd6c6" stroke-width="1.5"/><text x="75" y="88" text-anchor="middle">Client</text>
    <rect x="180" y="60" width="130" height="46" rx="4" fill="none" stroke="#7fd6c6" stroke-width="1.5"/><text x="245" y="80" text-anchor="middle">Edge/API</text><text x="245" y="95" text-anchor="middle" font-size="10" fill="#b9d8cf">auth, limits</text>
    <rect x="360" y="60" width="140" height="46" rx="4" fill="none" stroke="#7fd6c6" stroke-width="1.5"/><text x="430" y="80" text-anchor="middle">App Service</text><text x="430" y="95" text-anchor="middle" font-size="10" fill="#b9d8cf">business rules</text>
    <rect x="560" y="10" width="150" height="46" rx="4" fill="none" stroke="#7fd6c6" stroke-width="1.5" stroke-dasharray="3 2"/><text x="635" y="30" text-anchor="middle">Cache</text><text x="635" y="45" text-anchor="middle" font-size="10" fill="#b9d8cf">p99 under 10 ms</text>
    <rect x="560" y="90" width="150" height="46" rx="4" fill="none" stroke="#7fd6c6" stroke-width="1.5"/><text x="635" y="110" text-anchor="middle">Primary DB</text><text x="635" y="125" text-anchor="middle" font-size="10" fill="#b9d8cf">source of truth</text>
    <rect x="360" y="180" width="140" height="46" rx="4" fill="none" stroke="#d98c2b" stroke-width="1.5"/><text x="430" y="200" text-anchor="middle" fill="#f4d9ad">Queue</text><text x="430" y="215" text-anchor="middle" font-size="10" fill="#f4d9ad">absorbs bursts</text>
    <rect x="560" y="180" width="150" height="46" rx="4" fill="none" stroke="#d98c2b" stroke-width="1.5"/><text x="635" y="200" text-anchor="middle" fill="#f4d9ad">Workers</text><text x="635" y="215" text-anchor="middle" font-size="10" fill="#f4d9ad">volume path</text>
    <rect x="780" y="180" width="100" height="46" rx="4" fill="none" stroke="#d98c2b" stroke-width="1.5"/><text x="830" y="200" text-anchor="middle" fill="#f4d9ad">Data</text><text x="830" y="215" text-anchor="middle" font-size="10" fill="#f4d9ad">store</text>
    <rect x="360" y="270" width="350" height="46" rx="4" fill="none" stroke="#7fd6c6" stroke-width="1" stroke-dasharray="2 3"/><text x="535" y="290" text-anchor="middle">Observability</text><text x="535" y="305" text-anchor="middle" font-size="10" fill="#b9d8cf">p50/p95/p99, queue depth, errors</text>
  </g>
  <g stroke="#7fd6c6" stroke-width="1.5" marker-end="url(#arrow)" fill="none">
    <line x1="130" y1="83" x2="178" y2="83"/><line x1="310" y1="83" x2="358" y2="83"/><line x1="430" y1="60" x2="560" y2="33"/><line x1="500" y1="83" x2="560" y2="105"/><line x1="430" y1="106" x2="430" y2="178"/><line x1="500" y1="203" x2="558" y2="203"/><line x1="710" y1="203" x2="778" y2="203"/>
  </g>
  <text x="640" y="150" fill="#7fd6c6" font-family="monospace" font-size="10">fast read path: latency-bound</text>
  <text x="500" y="245" fill="#f4d9ad" font-family="monospace" font-size="10">durable write path: throughput-bound</text>
</svg>`;
}
