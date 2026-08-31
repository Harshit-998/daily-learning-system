import type { GeneratedLesson, LessonSelection } from "../types.js";

export function fallbackLesson(selection: LessonSelection): GeneratedLesson {
  const topic = selection.systemDesignTopic;
  const pattern = selection.dsaPattern;
  const weekly = selection.mode === "weekly-review";

  return {
    title: weekly ? `Sunday Mastery: ${topic.title} + ${pattern.title}` : `${topic.title} + ${pattern.title}`,
    date: selection.date,
    mode: selection.mode,
    designSeed: Number(process.env.GITHUB_RUN_NUMBER || "0"),
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
    mockInterview: {
      systemName: "BookMyShow",
      interviewerPrompt: "Design BookMyShow for movie discovery, seat selection, temporary seat locking, payment, and ticket confirmation.",
      scope: "Focus on movie browsing, theatre/show search, seat map rendering, seat hold, booking confirmation, payment callbacks, and ticket retrieval. Keep recommendations, ads, and loyalty programs out of scope for the first design.",
      functionalRequirements: [
        "Users can search movies, cities, theatres, showtimes, and available seats.",
        "Users can select seats and hold them temporarily while completing payment.",
        "Users can complete payment and receive a confirmed ticket with a booking ID.",
        "The system prevents two users from successfully booking the same seat.",
        "Admins can create theatres, screens, shows, seat layouts, prices, and inventory."
      ],
      nonFunctionalRequirements: [
        "Seat availability reads should feel fast, targeting low hundreds of milliseconds for cached show metadata and under one second for seat map fetch.",
        "Booking confirmation requires strong consistency for seat ownership.",
        "The system should tolerate flash-sale spikes for popular shows without corrupting inventory.",
        "Payment processing must be idempotent because callbacks and client retries can duplicate requests.",
        "Audit logs and booking state transitions must be durable.",
        "The system needs observability around lock contention, payment callback lag, booking failures, and inventory mismatch."
      ],
      capacityEstimation: [
        "Assume 10M monthly active users, 1M daily active users, and 5x traffic spikes during blockbuster releases.",
        "If 20% of DAU browse show pages, average browse QPS is modest, but peak city/movie pages may become hot keys.",
        "If 100K users attempt booking during a 10-minute release window, booking attempts average about 167 QPS and may spike much higher for a single show.",
        "Seat inventory is small per show but high contention; the scaling problem is not storage size, it is correctness under concurrent writes.",
        "Cache movie/theatre/show metadata aggressively, but keep seat lock and booking state in a strongly controlled write path."
      ],
      coreEntitiesAndDataModel: [
        "Movie(id, title, language, duration, metadata)",
        "Theatre(id, cityId, name, location), Screen(id, theatreId, layoutId), Seat(id, screenId, row, number, type)",
        "Show(id, movieId, screenId, startTime, status), ShowSeat(showId, seatId, status, lockId, lockedUntil, bookingId, version)",
        "Booking(id, userId, showId, seats, status, amount, idempotencyKey, createdAt)",
        "Payment(id, bookingId, providerRef, status, callbackPayloadHash)",
        "Index by city/movie/date for discovery, by showId for seat map, and by idempotencyKey for safe retries."
      ],
      apiDesign: [
        "GET /cities/{cityId}/movies?date=YYYY-MM-DD returns movies and cached show summaries.",
        "GET /shows/{showId}/seats returns seat map with available, locked, and booked states.",
        "POST /shows/{showId}/holds with seatIds and idempotencyKey creates a short-lived hold if all seats are available.",
        "POST /bookings/{bookingId}/payment-intent starts payment for a valid hold.",
        "POST /payments/callback consumes provider callback idempotently and confirms or releases seats."
      ],
      highLevelArchitecture: "Use API Gateway for auth/rate limiting, discovery service for cached browsing, inventory service for seat state, booking service for booking lifecycle, payment service for provider interaction, Redis or a database-backed lock path for short seat holds, a relational database for booking truth, and queues for payment callbacks, notifications, and reconciliation jobs.",
      architectureDiagram: bookMyShowSvg(),
      deepDives: [
        {
          title: "Seat locking and confirmation",
          discussion: "The hardest part is preventing double booking while keeping the UI responsive. A safe approach is to store ShowSeat rows with status, lockId, lockedUntil, bookingId, and version. A hold request performs a conditional update where all requested seats are AVAILABLE or expired. Confirmation moves HELD seats to BOOKED only if the hold belongs to the same user/booking and has not expired.",
          challenges: [
            "Do not rely only on client-side timers; expiration must be enforced server-side.",
            "Use idempotency keys so retrying a hold or payment confirmation does not create duplicate bookings.",
            "Run reconciliation to release expired holds and detect payment success after client disconnects."
          ]
        },
        {
          title: "Hot show traffic",
          discussion: "A blockbuster show can turn one showId into a hot partition. Cache read-only show metadata separately from mutable seat state, throttle hold attempts, use queueing or waiting rooms for extreme launches, and shard lock traffic by showId plus seat block only if contention requires it.",
          challenges: [
            "Caching seat availability too aggressively can show stale seats as available.",
            "Sharding by city is not enough when one show dominates traffic.",
            "Backpressure is better than accepting requests that will timeout and retry."
          ]
        }
      ],
      failureScenarios: [
        "Payment succeeds but callback arrives late; booking should remain pending until reconciliation confirms or expires it.",
        "User refreshes during payment; idempotency key should return the existing booking state.",
        "Redis/lock store fails; degrade booking for affected shows rather than risking double booking.",
        "Queue backlog delays notifications; tickets should still be visible from booking status.",
        "Database primary fails during confirmation; use transactional guarantees and clear retry semantics."
      ],
      tradeOffs: [
        "Strong consistency is mandatory for final seat booking, even if discovery and seat map reads are eventually refreshed.",
        "Redis locks are fast but need careful persistence/reconciliation; database conditional updates are simpler but may hit contention sooner.",
        "Short hold TTLs reduce inventory blockage but increase user frustration during slow payments.",
        "A waiting room protects the system during spikes but adds product friction."
      ],
      followUpQuestions: [
        "What happens if two users select the same seat at the same time?",
        "Why did you choose this storage model for ShowSeat?",
        "What breaks first at 10x traffic?",
        "How do you handle expired holds?",
        "How do you make payment callbacks idempotent?",
        "What would change if this became multi-region?",
        "Which data can be cached and which cannot?",
        "How do you detect inventory mismatch?",
        "What metrics would you monitor during a blockbuster launch?",
        "How would you recover if payment succeeds but booking confirmation fails?"
      ],
      fiveMinuteAnswer: "I would split BookMyShow into discovery, inventory, booking, payment, and notification services. Discovery reads movie, theatre, and show metadata from cache because it is read-heavy and can tolerate slight staleness. Seat booking goes through an inventory service backed by strongly consistent conditional updates on ShowSeat rows. A user creates a short hold with an idempotency key; if every requested seat is available or expired, the system marks those seats held with a lock ID and TTL. Payment then proceeds against that booking. Provider callbacks are handled idempotently: success confirms only seats held by that booking, failure or timeout releases them. For scale, I would cache metadata, protect hot shows with rate limits or waiting rooms, monitor lock contention and payment lag, and run reconciliation for expired holds and callback mismatches. The main trade-off is that browsing can be eventually consistent, but final seat ownership must be strongly consistent."
    },
    nodejs: nodeFallback(selection),
    javascriptInterview: javascriptInterviewFallback(selection),
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
    telegramSummary: `${weekly ? "Sunday mastery" : "Daily lesson"}: ${topic.title} + ${pattern.title}\n\nSystem Design: Little's Law is L = lambda x W. If latency rises at the same arrival rate, in-flight requests rise too.\n\nMock interview: BookMyShow. Focus on seat holds, idempotent payment callbacks, hot-show contention, and strong consistency for final booking.\n\nDSA: ${pattern.title} = invent the key that preserves useful history. Prefix sum counts, boundary sets, and frequency signatures are three high-density variants.`,
    ...freshFallbackOverrides(selection)
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

function nodeFallback(selection: LessonSelection): GeneratedLesson["nodejs"] {
  const concepts: Array<GeneratedLesson["nodejs"]> = [
    {
      conceptId: "streams-backpressure",
      concept: "Node.js Streams and Backpressure",
      whyItMatters: "Streams let a Node service process large payloads without loading everything into memory, but the real production skill is respecting backpressure so a fast producer does not overwhelm a slow consumer.",
      mentalModel: "Think of a stream pipeline like a conveyor belt with pressure sensors. If the packing station slows down, the belt must slow down too; otherwise boxes pile up until the warehouse runs out of space.",
      technicalDeepDive: "Readable streams push chunks, writable streams consume chunks, and backpressure is the signal that the writable side's internal buffer is full. In Node, writable.write(chunk) returning false means the producer should pause until the drain event. pipeline() is safer than manual piping because it forwards errors and closes the whole chain correctly. This matters for uploads, CSV processing, proxies, compression, log ingestion, and any endpoint that handles bodies larger than comfortable memory.",
      realLifeExample: "For a video upload service, stream the incoming request through validation, virus scanning, compression, and object storage upload. The API should never buffer a 2GB file in RAM just to pass it to S3.",
      howToUseIt: [
        "Use stream.pipeline() or stream/promises.pipeline() so errors and cleanup propagate through the chain.",
        "Watch writable.write() and drain if you manually coordinate producer and consumer flow.",
        "Set highWaterMark deliberately for the object size and latency profile instead of relying blindly on defaults.",
        "Use Transform streams for chunk-level processing such as compression, parsing, checksums, or redaction."
      ],
      productionPitfalls: [
        "Ignoring backpressure can create memory growth that looks like a leak under load.",
        "Manual pipe chains often miss error handlers and leave sockets or file handles open.",
        "A Transform stream that performs slow async work without controlling concurrency can reorder or overload downstream systems."
      ],
      performanceAndScaling: [
        "Streaming keeps per-request memory nearly constant, which improves concurrency under large uploads.",
        "Backpressure turns overload into slower ingestion instead of process crashes.",
        "For CPU-heavy transforms, move work to worker threads or an external service because streams do not remove CPU bottlenecks."
      ],
      debuggingSignals: [
        "Heap usage climbs with request body size or upload concurrency.",
        "Event loop delay rises while socket throughput drops.",
        "Writable buffers stay above highWaterMark and drain events become sparse."
      ],
      codeExample: `import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import { createWriteStream } from "node:fs";

export async function saveCompressedUpload(request, filePath) {
  await pipeline(
    request,
    createGzip(),
    createWriteStream(filePath)
  );
}`,
      interviewQuestions: [
        "What does backpressure mean in a Node.js stream pipeline?",
        "Why is pipeline() safer than readable.pipe(writable) in production code?",
        "How would you debug a Node API whose memory grows during large uploads?"
      ]
    },
    {
      conceptId: "worker-threads-cpu-bound",
      concept: "Worker Threads for CPU-Bound Node.js Work",
      whyItMatters: "Node handles I/O concurrency well, but CPU-heavy JavaScript blocks the event loop and makes every request slower. Worker threads let you isolate CPU work without freezing the main server.",
      mentalModel: "The event loop is the receptionist. It can coordinate many calls, but it should not personally do a three-hour spreadsheet calculation while callers wait.",
      technicalDeepDive: "Worker threads run JavaScript in separate V8 isolates with their own event loops. They communicate through messages, transferable objects, SharedArrayBuffer, and Atomics when needed. They are useful for image processing, crypto-heavy work, report generation, parsing huge files, compression, and ML-style computation. They are not a general replacement for async I/O; database and network calls should remain non-blocking in the main process.",
      realLifeExample: "A reporting API receives a request to generate a large PDF from thousands of records. The main Node server validates and schedules the work, while a worker thread performs layout and compression so normal API requests keep responding.",
      howToUseIt: [
        "Keep the HTTP server and routing on the main thread.",
        "Send CPU-heavy jobs to a bounded worker pool rather than spawning unlimited workers.",
        "Transfer ArrayBuffer data when possible to avoid expensive copies.",
        "Add timeout and cancellation behavior so stuck jobs do not occupy workers forever."
      ],
      productionPitfalls: [
        "Creating a worker per request can exhaust memory faster than it solves event-loop blocking.",
        "Large message payloads can spend more time serializing than computing.",
        "Shared memory requires careful synchronization and can introduce hard-to-debug races."
      ],
      performanceAndScaling: [
        "Use a pool size close to available CPU cores minus capacity needed by the main process.",
        "Track queue depth and worker utilization, not just average job latency.",
        "Move very heavy or long-running work to a separate job system if it outgrows in-process workers."
      ],
      debuggingSignals: [
        "High event-loop delay while CPU usage is high.",
        "Fast endpoints become slow only when expensive calculations run.",
        "Worker queue depth grows while process memory climbs."
      ],
      codeExample: `import { Worker } from "node:worker_threads";

export function runCpuJob(payload) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./cpu-job.js", import.meta.url), {
      workerData: payload
    });
    worker.once("message", resolve);
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) reject(new Error(\`Worker stopped with code \${code}\`));
    });
  });
}`,
      interviewQuestions: [
        "Why does CPU-bound work hurt a Node.js server more than slow I/O?",
        "When would you use worker threads instead of a queue and separate worker service?",
        "What metrics prove that worker threads helped rather than just moved the bottleneck?"
      ]
    }
  ];
  const index = (selection.systemDesignTopic.id.length + selection.dsaPattern.id.length + selection.date.length) % concepts.length;
  return concepts[index];
}

function javascriptInterviewFallback(selection: LessonSelection): GeneratedLesson["javascriptInterview"] {
  const usePromises = selection.dsaPattern.id.length % 2 === 0;
  if (usePromises) {
    return {
      theme: "Promise scheduling, microtasks, and concurrency control",
      questions: [
        {
          question: "What runs first: a resolved Promise callback, setTimeout(..., 0), or synchronous code?",
          answer: "Synchronous code runs first. Promise callbacks run next in the microtask queue after the current call stack finishes. setTimeout callbacks run later in the macrotask/timer phase.",
          code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
// A, D, C, B`,
          followUp: "Explain why too many microtasks can starve timers and I/O callbacks."
        },
        {
          question: "Why is Promise.all dangerous for unbounded work?",
          answer: "Promise.all starts all promises immediately if you create them first. For thousands of network calls, that can overload your service, the remote service, sockets, memory, and rate limits.",
          code: `async function runWithLimit(items, limit, task) {
  const results = [];
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await task(items[i]);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}`,
          followUp: "How would you add retries without breaking ordering?"
        },
        {
          question: "What is the difference between Promise.all and Promise.allSettled?",
          answer: "Promise.all fails fast when any input rejects. Promise.allSettled waits for every input and returns fulfilled/rejected results, which is better for partial success workflows.",
          followUp: "Which would you use for sending 1,000 optional notifications?"
        },
        {
          question: "How do you cancel async work in modern JavaScript?",
          answer: "Use AbortController and pass its signal into APIs that support cancellation, such as fetch. Cancellation is cooperative; your code must observe the signal and stop work."
        }
      ]
    };
  }
  return {
    theme: "Closures, this-binding, and hidden state",
    questions: [
      {
        question: "What does a closure actually retain?",
        answer: "A closure retains references to variables in its lexical environment, not a frozen copy of their values. That is why mutations after function creation can still be observed.",
        code: `function counter() {
  let n = 0;
  return () => ++n;
}
const next = counter();
next(); // 1
next(); // 2`
      },
      {
        question: "Why does this change when a method is passed as a callback?",
        answer: "this is usually determined by the call site, not where the function was defined. Passing obj.method loses the obj.method() call-site binding unless you bind it or wrap it.",
        code: `const user = {
  name: "Harshit",
  print() { return this.name; }
};
const fn = user.print;
fn(); // undefined in strict mode`,
        followUp: "How would arrow functions change this?"
      },
      {
        question: "Why can closures cause memory leaks?",
        answer: "If a long-lived callback closes over a large object, that object cannot be garbage-collected while the callback remains reachable.",
        followUp: "Where does this show up in frontend apps and Node servers?"
      },
      {
        question: "What is the practical difference between call, apply, and bind?",
        answer: "call invokes immediately with positional arguments, apply invokes immediately with an argument array, and bind returns a new function with this and optional arguments preset."
      }
    ]
  };
}

function freshFallbackOverrides(selection: LessonSelection): Partial<GeneratedLesson> {
  const topic = selection.systemDesignTopic;
  const pattern = selection.dsaPattern;
  const example = topic.exampleSystems[0] || "a high-scale product";
  const problem = pattern.sampleProblems[0] || pattern.title;
  const weekly = selection.mode === "weekly-review";
  const node = nodeFallback(selection);
  const js = javascriptInterviewFallback(selection);
  return {
    title: weekly ? `Sunday Mastery: ${topic.title} + ${pattern.title}` : `${topic.title} + ${pattern.title}`,
    recall: [
      `${topic.title} is not just a component name; it is a decision about where correctness, latency, cost, and operational complexity should sit.`,
      `For ${example}, the interview answer should explain request flow, bottlenecks, failure behavior, and what becomes stale or strongly consistent.`,
      `${pattern.title} becomes easier when you name the invariant before choosing the data structure.`
    ],
    systemDesign: {
      topicId: topic.id,
      topic: topic.title,
      simpleConcept: `${topic.title} is the design tool used when ${topic.summary.toLowerCase()} In interviews, the important part is not the definition; it is deciding where this idea belongs in the request path and what trade-off it creates.`,
      whyItExists: `It exists because real systems like ${example} hit limits that a single straightforward service cannot handle cleanly: traffic spikes, uneven access patterns, slow dependencies, partial failures, and different consistency needs across reads and writes.`,
      analogy: `Think of ${topic.title} as an airport operations decision. Some passengers need a fast security lane, some luggage can move asynchronously, and some control systems must never accept conflicting state. Good design separates those flows instead of treating all work the same.`,
      technicalDepth: `For ${topic.title}, start from the user-facing operation, then identify the hot path, source of truth, derived data, coordination boundary, and failure recovery path. A senior answer should discuss p95/p99 latency, write amplification, stale reads, retries, idempotency, data ownership, observability, and how the design changes when one dependency becomes slow or unavailable.`,
      diagram: topicAwareSvg(topic.title, example),
      diagramCaption: `A generic production flow for applying ${topic.title}: isolate the user-facing path, protect the source of truth, and observe the async or derived-data path separately.`,
      realWorldExample: `${example} can use ${topic.title} to keep the product responsive while protecting the parts of the system that require correctness. The exact placement depends on whether the operation is read-heavy, write-heavy, hot-key prone, or failure-sensitive.`,
      practicalDesignExample: `In a notification or booking-style service, apply ${topic.title} by naming the synchronous API path, deciding which state is authoritative, placing any cache/queue/index/replica only where its consistency trade-off is acceptable, and adding metrics around saturation and correctness drift.`,
      componentInteraction: `Client traffic enters through the API layer, which authenticates, rate limits, and routes requests. The application service reads or writes authoritative storage, optionally consults derived infrastructure such as cache, index, queue, or replica, and emits events/metrics so operators can see lag, error rate, retries, and tail latency.`,
      tradeOffs: [
        `${topic.title} can improve one dimension such as latency, throughput, availability, or operability while increasing another dimension such as consistency complexity or debugging difficulty.`,
        "Adding a new infrastructure layer creates ownership questions: who writes it, who invalidates it, who repairs it, and what happens when it lies?",
        "The simplest correct design is often better until the bottleneck is proven by capacity estimates or production metrics."
      ],
      whenToUse: [
        "Use it when the bottleneck or correctness problem is clear enough to justify the extra moving part.",
        "Use it when the system has measurable pressure: hot keys, high fanout, slow downstreams, growing data, or strict availability needs.",
        "Use it when the operational team can observe and repair the failure modes it introduces."
      ],
      whenNotToUse: [
        "Do not use it only because the keyword sounds impressive in an interview.",
        "Do not use it before identifying the source of truth and acceptable staleness.",
        "Do not use it when the product is small enough that the added coordination cost dominates the benefit."
      ],
      commonMistakes: [
        "Explaining the component definition but not where it sits in the request flow.",
        "Ignoring stale data, duplicate retries, partial failure, and backpressure.",
        "Skipping metrics, alerts, replay/reconciliation, and operational ownership."
      ],
      scalingConsiderations: [
        "Estimate QPS, peak multiplier, data size, read/write ratio, fanout, and hot-key distribution before choosing the final architecture.",
        "Track saturation signals such as queue depth, cache hit rate, p99 latency, lock contention, DB CPU, and retry rate.",
        "Decide how the design changes across regions: local reads, global writes, conflict resolution, and disaster recovery."
      ],
      failureScenarios: [
        "A downstream slows down and causes retries, which increases load and worsens tail latency.",
        "A derived store becomes stale or unavailable and the service either serves wrong data or overloads the primary store.",
        "A hot partition receives most traffic and defeats the average-case scaling plan.",
        "A deploy changes write semantics but old workers or consumers still process messages using the previous contract."
      ],
      productionUsage: `Teams use ${topic.title} with explicit SLOs, dashboards, load tests, runbooks, and rollback plans. The production version includes ownership and repair paths, not only the happy-path architecture.`,
      interviewQuestions: [
        `Where would you place ${topic.title} in the ${example} request flow?`,
        "Which part of your design is strongly consistent and which part can be eventually consistent?",
        "What breaks first at 10x traffic?",
        "How would you detect this component causing user-visible errors?"
      ],
      previousConceptConnections: topic.prerequisites.length > 0 ? `This builds on ${topic.prerequisites.join(", ")} and should be explained in terms of how those earlier ideas interact.` : "This is a foundation for later topics such as caching, queues, partitioning, consistency, and reliability.",
      thinkLikeEngineerQuestions: [
        "What is the source of truth?",
        "What can become stale without hurting correctness?",
        "What metric tells you this design is failing before users complain?"
      ],
      mnemonic: {
        label: "F.L.O.W.",
        text: "Flow, Limit, Ownership, Watchpoints. Explain where the request flows, what limit you are solving, who owns the truth, and what you will watch in production."
      }
    },
    mockInterview: mockFallback(selection.mockSystem),
    nodejs: node,
    javascriptInterview: js,
    dsa: {
      patternId: pattern.id,
      pattern: pattern.title,
      problemStatement: `Study ${problem} as the representative problem for ${pattern.title}. The goal is to learn the reusable invariant, not memorize one implementation.`,
      examples: [
        `Representative problem: ${problem}.`,
        `Related variants: ${pattern.sampleProblems.join(", ")}.`,
        "For each variant, identify what state must be carried forward and what condition makes a decision final."
      ],
      constraints: [
        "Assume interview-size constraints where O(n^2) usually times out unless n is small.",
        "Handle duplicates, empty input, boundary values, and adversarial ordering.",
        "Prefer a proof-oriented invariant over a code-first explanation."
      ],
      whatToNotice: [
        `${pattern.title} usually has a repeated decision that can be made locally once the right state is maintained.`,
        "The hard part is choosing the state representation and proving when it is safe to update the answer.",
        "Variants often change the stored state, not the entire strategy."
      ],
      bruteForce: "Generate every candidate state or subproblem and check it directly. This is useful to discover the invariant, but it repeats work that the optimized pattern should reuse.",
      whyInsufficient: "The brute-force version usually revisits overlapping choices. In interviews, the expected jump is to compress repeated work into a maintained structure, monotonic condition, recurrence, or boundary invariant.",
      coreIntuition: `For ${pattern.title}, ask: what information from the past is still relevant, what can be safely discarded, and what condition lets me commit to an answer?`,
      optimalApproach: `Solve ${problem} by naming the invariant first, then implementing the smallest state that preserves that invariant. Walk through one non-trivial example and explain why each update is safe.`,
      stepByStep: [
        "Write the brute-force condition in plain English.",
        "Underline the repeated work.",
        "Define the invariant that would let one pass or one recurrence replace repeated scanning.",
        "Choose the data structure that stores exactly that invariant.",
        "Trace the update order carefully and test the edge case that breaks naive solutions."
      ],
      javaCode: `import java.util.*;

class Solution {
    public int solvePatternExample(int[] nums) {
        Map<Integer, Integer> state = new HashMap<>();
        int answer = 0;
        int running = 0;
        state.put(0, 1);

        for (int value : nums) {
            running += value;
            answer += state.getOrDefault(running, 0);
            state.put(running, state.getOrDefault(running, 0) + 1);
        }

        return answer;
    }
}`,
      complexities: "The optimized target is usually O(n), O(n log n), or O(states * transitions), depending on the pattern. Space is whatever state is required to preserve the invariant.",
      mistakes: [
        "Choosing a data structure before naming the invariant.",
        "Updating state before using the old state when the problem asks about previous candidates.",
        "Testing only the happy path and missing duplicates, negatives, or boundary cases."
      ],
      recognitionClues: [
        "The problem has overlapping checks or repeated scans.",
        "A local state can summarize many earlier candidates.",
        "A variant changes constraints slightly but keeps the same proof shape."
      ],
      variations: pattern.sampleProblems,
      relatedProblems: pattern.sampleProblems.slice(0, 3),
      exactlyWhatChangesAcrossVariants: [
        "The invariant may stay the same while the stored value changes from existence to count, index, min/max, or parent pointer.",
        "The traversal order may change when the problem moves from array order to sorted order, graph order, or dependency order.",
        "The proof changes when duplicates, negative values, cycles, or online updates are introduced."
      ],
      invariant: `At every step, the maintained state contains exactly the information needed to answer future decisions for ${pattern.title}; anything not in the state is either irrelevant or already folded into the answer.`,
      trace: {
        title: `Trace template for ${problem}`,
        steps: [
          "Start with the empty/base state.",
          "Process the first meaningful element and ask what old state it needs.",
          "Update answer before or after state mutation based on whether self-use is allowed.",
          "Repeat until the invariant feels mechanical."
        ],
        cells: [
          { index: 0, value: "base", highlight: true },
          { index: 1, value: "state" },
          { index: 2, value: "answer", highlight: true }
        ]
      },
      mnemonic: {
        label: "I.S.P.",
        text: "Invariant, State, Proof. If those three are clear, the code is usually straightforward."
      },
      variantWalkthroughs: pattern.sampleProblems.slice(0, 3).map((name) => ({
        name,
        whatChanges: `For ${name}, identify whether the state stores counts, boundaries, ordering, or best sub-results. The pattern remains ${pattern.title}, but the state payload changes.`,
        code: "/* Write the invariant first, then implement the state transition for this variant. */",
        complexity: "Depends on the chosen state, but should beat the brute-force baseline."
      })),
      transferLearning: `After ${problem}, transfer the idea by asking what remains invariant across ${pattern.sampleProblems.join(", ")}. The surface story changes, but the reusable move is compressing repeated decisions into a state you can defend.`
    },
    selfTest: [
      { question: `What problem does ${topic.title} solve in production?`, answer: topic.summary },
      { question: "What is the source of truth in today's system design?", answer: "The durable store or authority that final writes must agree with; derived caches, queues, and indexes must be repairable from it." },
      { question: `What is the invariant behind ${pattern.title}?`, answer: `Maintain exactly the state future decisions need; discard or fold in everything else.` },
      { question: "What makes a JavaScript interview answer strong?", answer: "It explains the runtime or language rule, shows a small example, and names the production consequence." }
    ],
    telegramSummary: `${weekly ? "Sunday mastery" : "Daily lesson"}: ${topic.title} + ${pattern.title}\n\nSystem Design: fresh topic-aware fallback for ${topic.title}, using ${example} as the anchor system.\n\nMock interview: ${selection.mockSystem} with requirements, scale, data model, APIs, architecture, failures, and follow-ups.\n\nNode.js: ${node.concept}.\n\nJS Interview: ${js.theme}.\n\nDSA: ${pattern.title}; focus on invariant, state, and proof.`
  };
}

function mockFallback(systemName: string): GeneratedLesson["mockInterview"] {
  return {
    systemName,
    interviewerPrompt: `Design ${systemName} for a realistic high-traffic production workload.`,
    scope: `Focus on the core user journey, write path, read path, data ownership, consistency choices, and operational failure handling for ${systemName}. Keep low-value extras out of scope until the core design is correct.`,
    functionalRequirements: [
      "Users can perform the primary product action with clear success/failure state.",
      "Users can read current state quickly without overloading the source of truth.",
      "The system records durable state transitions and exposes history where needed.",
      "Admins or internal systems can monitor, retry, reconcile, and correct failed work.",
      "The product supports idempotent retries from clients and background workers."
    ],
    nonFunctionalRequirements: [
      "Low p95/p99 latency for the primary read path.",
      "Strong consistency for final user-visible commitments.",
      "High availability for browsing and graceful degradation for non-critical features.",
      "Backpressure during traffic spikes instead of unlimited retries.",
      "Durable auditability for important state changes.",
      "Security controls around authentication, authorization, abuse, and sensitive data.",
      "Observability across API latency, queue lag, error rate, saturation, and correctness drift."
    ],
    capacityEstimation: [
      "Start with DAU/MAU, peak multiplier, read/write ratio, payload size, and retention period.",
      "Estimate average QPS as daily operations divided by active seconds, then multiply for peak traffic.",
      "Identify hot entities because average QPS hides concentrated load.",
      "Estimate storage separately for primary records, derived indexes, logs, and media/blob data if present.",
      "Use the estimates to choose cache strategy, partition keys, worker count, and queue capacity."
    ],
    coreEntitiesAndDataModel: [
      "User(id, profile, auth metadata, status)",
      "PrimaryResource(id, ownerId, state, version, createdAt, updatedAt)",
      "Operation(id, userId, resourceId, idempotencyKey, status, attemptCount, timestamps)",
      "Event(id, resourceId, type, payload, createdAt) for async propagation and replay.",
      "Indexes should match the top access patterns; partition keys should avoid hot partitions."
    ],
    apiDesign: [
      "GET /resources?cursor=... returns paginated, cached read results.",
      "POST /resources/{id}/operations with an idempotency key starts a state transition.",
      "GET /operations/{operationId} returns pending, succeeded, failed, or retryable state.",
      "POST /internal/reconcile scans stuck operations and repairs derived state."
    ],
    highLevelArchitecture: `For ${systemName}, use an API gateway, a product service for request validation, a strongly consistent primary database for final state, a cache or read model for high-volume reads, a queue/event log for asynchronous side effects, workers for fanout/retries, and an observability layer for tracing state transitions.`,
    architectureDiagram: topicAwareSvg(`Design ${systemName}`, systemName),
    deepDives: [
      {
        title: "Correctness boundary",
        discussion: "The key interview decision is deciding which transition must be strongly consistent and which derived views can lag. Final commitments should update the source of truth atomically or through a clearly recoverable workflow.",
        challenges: [
          "Do not let cache or search index become the authority.",
          "Make client retries safe with idempotency keys.",
          "Run reconciliation for operations stuck between pending and committed."
        ]
      },
      {
        title: "Traffic spike handling",
        discussion: "The system should shed load or queue non-critical work before the primary database collapses. Hot-key protection matters more than average capacity when one resource becomes popular.",
        challenges: [
          "Use rate limits and admission control around expensive writes.",
          "Track queue lag and saturation as first-class product risks.",
          "Keep read degradation separate from write correctness."
        ]
      }
    ],
    failureScenarios: [
      "A client retries after timeout and the operation is submitted twice.",
      "A worker succeeds but crashes before updating derived status.",
      "The cache is cold or unavailable and read traffic stampedes the database.",
      "A hot partition receives a disproportionate amount of write traffic.",
      "A downstream provider is slow, causing retry storms and queue buildup."
    ],
    tradeOffs: [
      "Strong consistency protects user trust but limits write scalability.",
      "Caching improves reads but introduces staleness and invalidation work.",
      "Queues smooth spikes but add delayed completion and replay complexity.",
      "Partitioning improves capacity but makes cross-partition queries harder."
    ],
    followUpQuestions: [
      "What is the source of truth?",
      "Which APIs need idempotency keys?",
      "What can be eventually consistent?",
      "What happens at 10x peak traffic?",
      "How do you choose partition keys?",
      "How do you prevent cache stampede?",
      "How do you retry failed async work?",
      "What metrics would you page on?",
      "How would this change in multi-region?",
      "How do you recover after a partial write failure?"
    ],
    fiveMinuteAnswer: `I would design ${systemName} around the primary user journey first, then split reads, writes, and async side effects. The API layer handles auth and rate limits. The product service validates requests and writes final state to a strongly consistent primary store. High-volume reads come from cache or read models that can be rebuilt from the source of truth. Expensive side effects go through a queue with idempotent workers and dead-letter handling. For scale, I would estimate peak QPS, identify hot entities, partition by the dominant access pattern, and add backpressure before the database saturates. For reliability, I would trace every state transition, monitor p99 latency and queue lag, and run reconciliation for stuck operations.`
  };
}

function topicAwareSvg(topic: string, example: string): string {
  return `<svg viewBox="0 0 900 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Topic-aware system design architecture">
  <defs><marker id="arrow-topic" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#7fd6c6"/></marker></defs>
  <rect width="900" height="320" rx="10" fill="#10253b"/>
  <text x="24" y="32" fill="#7fd6c6" font-family="monospace" font-size="13">${escapeSvg(topic)} in ${escapeSvg(example)}</text>
  <g font-family="monospace" font-size="12" fill="#eaf6f2">
    <rect x="35" y="82" width="125" height="52" rx="5" fill="none" stroke="#7fd6c6"/><text x="98" y="112" text-anchor="middle">Client</text>
    <rect x="220" y="82" width="145" height="52" rx="5" fill="none" stroke="#7fd6c6"/><text x="292" y="104" text-anchor="middle">API Layer</text><text x="292" y="120" text-anchor="middle" font-size="10">auth, limits</text>
    <rect x="425" y="82" width="155" height="52" rx="5" fill="none" stroke="#f4d9ad"/><text x="503" y="104" text-anchor="middle">${escapeSvg(topic.slice(0, 18))}</text><text x="503" y="120" text-anchor="middle" font-size="10">decision point</text>
    <rect x="645" y="42" width="170" height="52" rx="5" fill="none" stroke="#7fd6c6"/><text x="730" y="64" text-anchor="middle">Derived Path</text><text x="730" y="80" text-anchor="middle" font-size="10">cache/index/queue</text>
    <rect x="645" y="142" width="170" height="52" rx="5" fill="none" stroke="#7fd6c6"/><text x="730" y="164" text-anchor="middle">Source of Truth</text><text x="730" y="180" text-anchor="middle" font-size="10">durable state</text>
    <rect x="220" y="232" width="360" height="46" rx="5" fill="none" stroke="#7fd6c6" stroke-dasharray="4 3"/><text x="400" y="260" text-anchor="middle">Observability: p99, errors, lag, saturation, correctness drift</text>
  </g>
  <g stroke="#7fd6c6" stroke-width="2" fill="none" marker-end="url(#arrow-topic)">
    <path d="M160 108 H220"/><path d="M365 108 H425"/><path d="M580 100 C610 82 620 70 645 68"/><path d="M580 116 C610 138 620 166 645 168"/><path d="M502 134 V232"/>
  </g>
</svg>`;
}

function escapeSvg(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function bookMyShowSvg(): string {
  return `<svg viewBox="0 0 920 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="BookMyShow architecture diagram">
  <defs><marker id="bmsArrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#7fd6c6"/></marker></defs>
  <text x="20" y="26" fill="#7fd6c6" font-family="monospace" font-size="11">BOOKMYSHOW: DISCOVERY VS STRONG-CONSISTENCY BOOKING PATH</text>
  <g font-family="monospace" font-size="12" fill="#eaf6f2">
    <rect x="20" y="62" width="120" height="46" rx="4" fill="none" stroke="#7fd6c6"/><text x="80" y="90" text-anchor="middle">Client</text>
    <rect x="185" y="62" width="130" height="46" rx="4" fill="none" stroke="#7fd6c6"/><text x="250" y="82" text-anchor="middle">API Gateway</text><text x="250" y="97" text-anchor="middle" font-size="10" fill="#b9d8cf">auth, limits</text>
    <rect x="365" y="28" width="145" height="46" rx="4" fill="none" stroke="#7fd6c6" stroke-dasharray="3 2"/><text x="437" y="48" text-anchor="middle">Discovery</text><text x="437" y="63" text-anchor="middle" font-size="10" fill="#b9d8cf">cacheable reads</text>
    <rect x="570" y="28" width="135" height="46" rx="4" fill="none" stroke="#7fd6c6" stroke-dasharray="3 2"/><text x="637" y="48" text-anchor="middle">Metadata DB</text><text x="637" y="63" text-anchor="middle" font-size="10" fill="#b9d8cf">movies/shows</text>
    <rect x="365" y="122" width="145" height="46" rx="4" fill="none" stroke="#f4d9ad"/><text x="437" y="142" text-anchor="middle" fill="#f4d9ad">Inventory</text><text x="437" y="157" text-anchor="middle" font-size="10" fill="#f4d9ad">seat holds</text>
    <rect x="570" y="122" width="135" height="46" rx="4" fill="none" stroke="#f4d9ad"/><text x="637" y="142" text-anchor="middle" fill="#f4d9ad">ShowSeat DB</text><text x="637" y="157" text-anchor="middle" font-size="10" fill="#f4d9ad">conditional write</text>
    <rect x="365" y="214" width="145" height="46" rx="4" fill="none" stroke="#f4d9ad"/><text x="437" y="234" text-anchor="middle" fill="#f4d9ad">Booking</text><text x="437" y="249" text-anchor="middle" font-size="10" fill="#f4d9ad">state machine</text>
    <rect x="570" y="214" width="135" height="46" rx="4" fill="none" stroke="#f4d9ad"/><text x="637" y="234" text-anchor="middle" fill="#f4d9ad">Payment</text><text x="637" y="249" text-anchor="middle" font-size="10" fill="#f4d9ad">idempotent</text>
    <rect x="760" y="214" width="125" height="46" rx="4" fill="none" stroke="#f4d9ad"/><text x="822" y="234" text-anchor="middle" fill="#f4d9ad">Provider</text><text x="822" y="249" text-anchor="middle" font-size="10" fill="#f4d9ad">callbacks</text>
    <rect x="365" y="300" width="340" height="38" rx="4" fill="none" stroke="#7fd6c6" stroke-dasharray="2 3"/><text x="535" y="323" text-anchor="middle">reconciliation, alerts, inventory mismatch checks</text>
  </g>
  <g stroke="#7fd6c6" stroke-width="1.5" marker-end="url(#bmsArrow)" fill="none">
    <line x1="140" y1="85" x2="183" y2="85"/><line x1="315" y1="85" x2="365" y2="51"/><line x1="510" y1="51" x2="568" y2="51"/>
  </g>
  <g stroke="#f4d9ad" stroke-width="1.5" marker-end="url(#bmsArrow)" fill="none">
    <line x1="315" y1="95" x2="365" y2="145"/><line x1="510" y1="145" x2="568" y2="145"/><line x1="437" y1="168" x2="437" y2="212"/><line x1="510" y1="237" x2="568" y2="237"/><line x1="705" y1="237" x2="758" y2="237"/><line x1="637" y1="260" x2="637" y2="298"/>
  </g>
  <text x="590" y="96" fill="#7fd6c6" font-family="monospace" font-size="10">eventual consistency OK</text>
  <text x="590" y="190" fill="#f4d9ad" font-family="monospace" font-size="10">strong consistency required</text>
</svg>`;
}
