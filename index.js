import express from "express";

const app = express();
app.use(express.json({ limit: "1mb" }));

const profile = {
  id: "chainscope",
  name: "Chainscope Atlas",
  version: "1.0.0",
  tagline: "Onchain monitoring and wallet intelligence",
  description: "A focused MCP and A2A agent for token briefs, chain health snapshots, and wallet risk screening.",
  heroLabel: "Onchain Profile",
  author: "dataweb",
  theme: {
    page: "#051519",
    panel: "rgba(8, 24, 27, 0.82)",
    panelEdge: "rgba(20, 184, 166, 0.24)",
    accent: "#0f766e",
    accentSoft: "#2dd4bf",
    glow: "rgba(15, 118, 110, 0.22)"
  },
  agents: {
    indexer: (task) => `Indexer gathered chain references for ${task}.`,
    sentinel: (task) => `Sentinel highlighted wallet and flow risk for ${task}.`,
    allocator: (task) => `Allocator ranked the next moves for ${task}.`
  },
  tools: [
    {
      name: "token_brief",
      description: "Generate a concise token brief for a symbol or project.",
      inputSchema: { type: "object", properties: { token: { type: "string", description: "Token symbol or project name" } }, required: ["token"] }
    },
    {
      name: "wallet_risk",
      description: "Screen a wallet label for concentration and behavior risk.",
      inputSchema: { type: "object", properties: { wallet: { type: "string", description: "Wallet address or label" } }, required: ["wallet"] }
    },
    {
      name: "chain_summary",
      description: "Summarize chain activity for a network.",
      inputSchema: { type: "object", properties: { network: { type: "string", description: "Network to summarize" } }, required: ["network"] }
    },
    {
      name: "signal_feed",
      description: "Produce a short watchlist feed around a theme.",
      inputSchema: { type: "object", properties: { theme: { type: "string", description: "Theme for the watchlist feed" } } }
    },
    {
      name: "multi_agent",
      description: "Run the indexer, sentinel, and allocator chain.",
      inputSchema: { type: "object", properties: { task: { type: "string", description: "Onchain task to coordinate" } }, required: ["task"] }
    }
  ],
  prompts: [
    {
      name: "onchain_alpha",
      description: "Prompt template for onchain opportunity research.",
      arguments: [{ name: "thesis", description: "Narrative or catalyst to investigate", required: false }]
    },
    {
      name: "wallet_monitor",
      description: "Prompt template for monitoring a strategic wallet set.",
      arguments: [{ name: "segment", description: "Wallet category or cohort", required: false }]
    }
  ],
  skills: [
    { name: "onchain_alpha", description: "Prompt template for onchain opportunity research." },
    { name: "wallet_monitor", description: "Prompt template for monitoring a strategic wallet set." },
    { name: "token_brief", description: "Generate concise token briefs for active assets." },
    { name: "wallet_risk", description: "Screen wallet behavior for concentration and risk clues." },
    { name: "chain_summary", description: "Summarize chain activity, throughput, and fee context." },
    { name: "signal_feed", description: "Produce fast watchlist updates around a chosen theme." },
    { name: "liquidity_watch", description: "Track liquidity changes across venues and token pairs." },
    { name: "bridge_flow", description: "Analyze bridge flows and cross-chain capital movement." },
    { name: "smart_money_trace", description: "Follow notable wallets and infer positioning changes." },
    { name: "contract_watch", description: "Monitor contract interactions and behavior anomalies." },
    { name: "launch_monitor", description: "Watch new launches, mint events, and early market traction." },
    { name: "holder_distribution", description: "Assess holder concentration and ownership structure." },
    { name: "dex_activity_scan", description: "Read DEX activity for flow, volatility, and momentum clues." },
    { name: "risk_alerts", description: "Highlight onchain conditions that raise immediate risk." },
    { name: "thesis_validation", description: "Validate or challenge an onchain thesis with supporting signals." }
  ],
  resources: [
    {
      uri: "resource://chainscope/chain-metrics",
      name: "chain_metrics",
      description: "Mock throughput, fee, and user trend metrics.",
      mimeType: "application/json"
    },
    {
      uri: "resource://chainscope/watchlist",
      name: "watchlist",
      description: "Token and wallet watchlist used by Chainscope Atlas.",
      mimeType: "application/json"
    }
  ]
};

const memory = {};

function getBaseUrl(req) {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
  return `${protocol}://${req.get("host")}`;
}

function getSessionId(req) {
  return req.headers["x-session-id"] || "default";
}

function ensureSession(sessionId) {
  if (!memory[sessionId]) memory[sessionId] = [];
  return memory[sessionId];
}

function logEntry(sessionId, entry) {
  ensureSession(sessionId).push({ timestamp: Date.now(), ...entry });
}

function rpcSuccess(id, result) { return { jsonrpc: "2.0", id, result }; }
function rpcError(id, code, message) { return { jsonrpc: "2.0", id: id ?? null, error: { code, message } }; }
function makeText(text) { return { content: [{ type: "text", text }] }; }

function buildAgentCard(req) {
  const baseUrl = getBaseUrl(req);
  return {
    name: profile.name,
    description: profile.description,
    url: `${baseUrl}/`,
    version: profile.version,
    author: profile.author,
    capabilities: ["mcp", "a2a", "tools", "prompts", "resources"],
    endpoints: { mcp: `${baseUrl}/mcp`, a2a: `${baseUrl}/a2a`, agentCard: `${baseUrl}/.well-known/agent-card.json` },
    skills: profile.skills
  };
}

function getOverview(req) {
  return {
    profile: profile.id,
    serverInfo: { name: profile.name, version: profile.version },
    protocol: "MCP over JSON-RPC 2.0",
    transport: { endpoint: `${getBaseUrl(req)}/mcp`, method: "POST", contentType: "application/json" },
    capabilities: { tools: {}, prompts: {}, resources: {} },
    tools: profile.tools,
    prompts: profile.prompts,
    resources: profile.resources
  };
}

function executeTool(toolName, args, sessionId) {
  logEntry(sessionId, { type: "tool", name: toolName, arguments: args });
  if (toolName === "token_brief") return makeText(`Token brief for ${args.token}: liquidity is healthy, narrative strength is moderate, and watchlist status is active.`);
  if (toolName === "wallet_risk") return makeText(`Wallet risk for ${args.wallet}: medium concentration, moderate velocity, and no immediate escalation flags.`);
  if (toolName === "chain_summary") return makeText(`Chain summary for ${args.network}: active addresses rising, fee pressure contained, and stable throughput observed.`);
  if (toolName === "signal_feed") return makeText(`Signal feed for ${args.theme || "rotation"}: two momentum setups, one crowded trade, and one wallet cluster worth tracking.`);
  if (toolName === "multi_agent") return makeText(["Chainscope multi-agent run complete.", profile.agents.indexer(args.task), profile.agents.sentinel(args.task), profile.agents.allocator(args.task)].join("\n"));
  throw new Error(`Unknown tool: ${toolName}`);
}

function getPrompt(promptName, args = {}) {
  if (promptName === "onchain_alpha") {
    const thesis = args.thesis || "an early rotation thesis";
    return { description: "Onchain alpha research prompt.", messages: [{ role: "user", content: { type: "text", text: `Investigate ${thesis}. Include wallet behavior, chain flows, liquidity changes, and invalidation points.` } }] };
  }
  if (promptName === "wallet_monitor") {
    const segment = args.segment || "smart-money wallets";
    return { description: "Wallet monitoring prompt.", messages: [{ role: "user", content: { type: "text", text: `Create a monitoring plan for ${segment}. Track accumulation, distribution, chain migration, and risk alerts.` } }] };
  }
  throw new Error(`Unknown prompt: ${promptName}`);
}

function readResource(uri) {
  if (uri === "resource://chainscope/chain-metrics") {
    return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ metrics: [
      { network: "ethereum", activeAddresses: 742000, feeTrend: "stable" },
      { network: "base", activeAddresses: 221000, feeTrend: "rising" },
      { network: "solana", activeAddresses: 1180000, feeTrend: "low" }
    ] }, null, 2) }] };
  }
  if (uri === "resource://chainscope/watchlist") {
    return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ tokens: ["ETH", "ENA", "PENDLE"], wallets: ["fund-alpha", "mm-desk-7", "rotation-cluster"] }, null, 2) }] };
  }
  throw new Error(`Unknown resource: ${uri}`);
}

function runA2A(agentName, task, sessionId) {
  const agent = profile.agents[agentName];
  if (!agent) throw new Error(`Unknown agent: ${agentName}`);
  logEntry(sessionId, { type: "a2a", agent: agentName, task });
  return { agent: agentName, result: agent(task || "default task"), status: "ok", profile: profile.id };
}

function handleRpc(req, res) {
  const body = req.body || {};
  const id = body.id ?? null;
  const method = body.method;
  const params = body.params || {};
  const sessionId = getSessionId(req);
  if (!method) return res.status(400).json(rpcError(id, -32600, "Missing JSON-RPC method"));

  try {
    if (method === "initialize") return res.json(rpcSuccess(id, { protocolVersion: "2024-11-05", capabilities: { tools: {}, prompts: {}, resources: {} }, serverInfo: { name: profile.name, version: profile.version }, instructions: "Use tools/list, prompts/list, and resources/list to inspect available capabilities." }));
    if (method === "ping") return res.json(rpcSuccess(id, {}));
    if (method === "notifications/initialized") return id === null ? res.status(202).end() : res.json(rpcSuccess(id, {}));
    if (method === "tools/list") return res.json(rpcSuccess(id, { tools: profile.tools }));
    if (method === "tools/call") return res.json(rpcSuccess(id, executeTool(params.name, params.arguments || {}, sessionId)));
    if (method === "prompts/list") return res.json(rpcSuccess(id, { prompts: profile.prompts }));
    if (method === "prompts/get") return res.json(rpcSuccess(id, getPrompt(params.name, params.arguments || {})));
    if (method === "resources/list") return res.json(rpcSuccess(id, { resources: profile.resources }));
    if (method === "resources/read") return res.json(rpcSuccess(id, readResource(params.uri)));
    return res.status(404).json(rpcError(id, -32601, `Method not found: ${method}`));
  } catch (error) {
    return res.status(400).json(rpcError(id, -32000, error instanceof Error ? error.message : "Internal error"));
  }
}

function buildUi() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${profile.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root{--page:#1f1613;--paper:#2a1d19;--panel:#37251f;--panel-soft:rgba(79,53,39,.52);--edge:rgba(215,173,104,.24);--accent:#c86f4a;--accent-soft:#d9b26c;--accent-deep:#7c5447;--olive:#6f7f57;--text:#f6eee4;--muted:#d1bda9;--line:rgba(255,255,255,.08)}
    *{box-sizing:border-box}
    html{scroll-behavior:smooth}
    body{margin:0;font-family:"Manrope",sans-serif;color:var(--text);background:radial-gradient(circle at top left,rgba(201,111,74,.18),transparent 28%),radial-gradient(circle at 82% 22%,rgba(217,178,108,.11),transparent 22%),linear-gradient(180deg,rgba(255,255,255,.02),transparent 16%),var(--page);min-height:100vh;overflow-x:hidden}
    body::before{content:"";position:fixed;inset:0;background:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:46px 46px;mask-image:radial-gradient(circle at center,black,transparent 86%);pointer-events:none;opacity:.15}
    #particle-field{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.92}
    .shell{position:relative;z-index:1;max-width:1220px;margin:0 auto;padding:24px}
    .nav,.hero,.panel{border:1px solid var(--edge);background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.015)),var(--panel-soft);backdrop-filter:blur(12px);box-shadow:0 28px 70px rgba(0,0,0,.28)}
    .nav{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 18px;border-radius:22px;background:rgba(42,29,25,.74);position:sticky;top:14px;z-index:4}
    .brand{display:flex;align-items:center;gap:14px}
    .brand-mark{width:46px;height:46px;border-radius:14px;background:conic-gradient(from 180deg,var(--accent-soft),var(--accent),var(--olive),var(--accent-soft));display:grid;place-items:center;color:#201410;font-weight:800;font-family:"Cormorant Garamond",serif;font-size:20px;box-shadow:0 12px 24px rgba(0,0,0,.22)}
    .brand strong,.eyebrow,.badge,.float-link strong,h1,h2{font-family:"Cormorant Garamond",serif;letter-spacing:-.02em}
    .brand strong{display:block;font-size:26px;line-height:.9}
    .brand span,.nav-links a,p,.meta{color:var(--muted)}
    .nav-links{display:flex;gap:16px;flex-wrap:wrap}
    .nav-links a{font-size:14px;transition:color .18s ease,transform .18s ease}.nav-links a:hover{color:var(--text);transform:translateY(-1px)}
    .hero{position:relative;overflow:hidden;border-radius:34px;margin-top:18px;padding:30px;background:radial-gradient(circle at 88% 18%,rgba(217,178,108,.09),transparent 18%),linear-gradient(180deg,rgba(56,37,31,.88),rgba(41,29,25,.76))}
    .hero::after,.hero::before{content:"";position:absolute;border-radius:999px;pointer-events:none}.hero::after{width:280px;height:280px;right:-100px;top:-100px;background:radial-gradient(circle,rgba(200,111,74,.22),transparent 64%)}.hero::before{width:200px;height:200px;left:-50px;bottom:-80px;background:radial-gradient(circle,rgba(111,127,87,.18),transparent 70%)}
    .hero-grid,.main-grid,.stats,.endpoints,.float-menu{display:grid;gap:18px}
    .hero-grid{grid-template-columns:1.2fr .8fr;align-items:end}
    .main-grid{grid-template-columns:1.08fr .92fr;margin-top:24px}
    .stats,.endpoints{grid-template-columns:repeat(2,minmax(0,1fr))}
    .eyebrow,.badge{display:inline-flex;align-items:center;padding:8px 12px;border-radius:999px;border:1px solid var(--edge);background:rgba(255,255,255,.05);color:var(--accent-soft);font-size:12px;text-transform:uppercase;letter-spacing:.14em}
    h1,h2{margin:0;line-height:.92}h1{margin-top:16px;font-size:clamp(44px,8vw,80px);max-width:10ch}h2{font-size:40px}
    .hero p{max-width:60ch;font-size:16px;line-height:1.74}
    .cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}.cta,.ghost,button{border:0;border-radius:16px;padding:12px 16px;font:inherit;font-weight:800;cursor:pointer;transition:transform .2s ease,filter .2s ease,border-color .2s ease}.cta,button{background:linear-gradient(135deg,var(--accent-soft),var(--accent));color:#24160f;box-shadow:0 14px 28px rgba(200,111,74,.22)}.ghost{background:rgba(255,255,255,.04);color:var(--text);border:1px solid var(--edge)}.cta:hover,.ghost:hover,button:hover{transform:translateY(-2px);filter:brightness(1.04)}
    .hero-note{margin-top:16px;font-size:14px;color:var(--muted)}
    .card,.endpoint,.item,.float-link{border-radius:22px;border:1px solid var(--line);background:rgba(255,255,255,.03);transition:transform .22s ease,border-color .22s ease,background .22s ease}.card:hover,.endpoint:hover,.item:hover,.float-link:hover{transform:translateY(-4px);border-color:rgba(217,178,108,.32);background:rgba(255,255,255,.05)}
    .card,.endpoint{padding:18px}.card strong,.endpoint strong{display:block;margin-top:8px;font-size:28px;font-family:"Cormorant Garamond",serif}.list{display:grid;gap:12px}.item{padding:14px 16px}.item strong{display:block;margin-bottom:6px;font-size:17px}
    .panel{padding:22px;border-radius:28px;opacity:0;transform:translateY(26px);transition:opacity .65s ease,transform .65s ease}.panel.is-visible{opacity:1;transform:translateY(0)}
    .section-head{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-bottom:16px}.section-copy{margin:0 0 18px;max-width:50ch}
    .endpoint code,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.endpoint code{display:block;margin-top:10px;padding:12px;border-radius:14px;background:rgba(0,0,0,.24);color:#f4dcc0;overflow-wrap:anywhere}
    .toolbar{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}pre{margin:14px 0 0;min-height:270px;max-height:430px;overflow:auto;padding:16px;border-radius:18px;background:rgba(18,12,10,.54);color:#f5e8d6;border:1px solid rgba(217,178,108,.14)}
    .float-menu{position:fixed;right:18px;bottom:18px;z-index:3;transform:translateY(24px);opacity:0;transition:opacity .28s ease,transform .28s ease}.float-menu.is-visible{opacity:1;transform:translateY(0)}
    .float-link{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;min-width:180px;background:rgba(42,29,25,.84);backdrop-filter:blur(10px)}.float-link span{color:var(--muted);font-size:13px}
    @media (max-width:980px){.hero-grid,.main-grid,.stats,.endpoints{grid-template-columns:1fr}.float-menu{left:16px;right:16px}}
    @media (max-width:720px){.shell{padding:16px}.nav{padding:14px 16px}.nav-links{display:none}.hero,.panel{border-radius:24px;padding:18px}h1{font-size:46px}.float-menu{bottom:12px}}
  </style>
</head>
<body>
  <canvas id="particle-field"></canvas>
  <div class="shell">
    <nav class="nav">
      <div class="brand">
        <div class="brand-mark">CS</div>
        <div>
          <strong>${profile.name}</strong>
          <span>${profile.tagline}</span>
        </div>
      </div>
      <div class="nav-links">
        <a href="#signals">Signals</a>
        <a href="#maps">Maps</a>
        <a href="#console">Console</a>
      </div>
    </nav>

    <section class="hero panel is-visible">
      <div class="hero-grid">
        <div>
          <span class="eyebrow">${profile.heroLabel}</span>
          <h1>Trace wallets, flows, and rituals across the chain.</h1>
          <p>${profile.description} Chainscope now leans into a bohemian visual language: earthy pigments, ornate typography, layered paper-like panels, and a moving field that reacts to the viewer.</p>
          <div class="cta-row">
            <a class="cta" href="#console">Open live tester</a>
            <a class="ghost" href="/.well-known/agent-card.json">Agent card</a>
          </div>
          <div class="hero-note">Built for onchain hunters, watchlist curators, and signal readers who prefer atmosphere over boilerplate.</div>
        </div>
        <div class="stats">
          <div class="card"><span class="badge">Tools</span><strong>${profile.tools.length}</strong><p>Callable scanning modules</p></div>
          <div class="card"><span class="badge">Prompts</span><strong>${profile.prompts.length}</strong><p>Reusable research rituals</p></div>
          <div class="card"><span class="badge">Resources</span><strong>${profile.resources.length}</strong><p>Embedded onchain context</p></div>
          <div class="card"><span class="badge">Agents</span><strong>${Object.keys(profile.agents).length}</strong><p>Indexer, sentinel, allocator</p></div>
        </div>
      </div>
    </section>

    <section class="main-grid">
      <div class="panel reveal" id="signals">
        <div class="section-head"><h2>Signals</h2><span class="badge">MCP</span></div>
        <p class="section-copy">Earth-toned workflow cards for token briefs, wallet risk, chain summaries, and rotating watchlist reads.</p>
        <div class="list">${profile.tools.map((tool) => `<div class="item"><strong>${tool.name}</strong><p>${tool.description}</p></div>`).join("")}</div>
      </div>

      <div class="panel reveal" id="maps">
        <div class="section-head"><h2>Maps</h2><span class="badge">Routes</span></div>
        <p class="section-copy">Public entry points for scanners, clients, and explorers.</p>
        <div class="endpoints">
          <div class="endpoint"><span class="badge">MCP</span><code>/mcp</code></div>
          <div class="endpoint"><span class="badge">A2A</span><code>/a2a</code></div>
          <div class="endpoint"><span class="badge">Agent Card</span><code>/.well-known/agent-card.json</code></div>
          <div class="endpoint"><span class="badge">Resource</span><code>/resources/chain_metrics</code></div>
        </div>
      </div>

      <div class="panel reveal">
        <div class="section-head"><h2>Context</h2><span class="badge">Prompts</span></div>
        <p class="section-copy">Prompt rituals and resource objects that support narrative, liquidity, and wallet research.</p>
        <div class="list">${profile.prompts.map((prompt) => `<div class="item"><strong>${prompt.name}</strong><p>${prompt.description}</p></div>`).join("")}${profile.resources.map((resource) => `<div class="item"><strong>${resource.name}</strong><p>${resource.uri}</p></div>`).join("")}</div>
      </div>

      <div class="panel reveal" id="console">
        <div class="section-head"><h2>Console</h2><span class="badge">JSON-RPC</span></div>
        <p class="section-copy">The runtime stays practical: initialize, inspect tools, call the first module, read resources, and run the agent chain.</p>
        <div class="toolbar"><button id="initializeBtn">Initialize</button><button id="toolsBtn">Tools List</button><button id="toolCallBtn">Call First Tool</button><button id="resourceBtn">Read First Resource</button><button id="a2aBtn">Run A2A</button></div>
        <pre id="output">Use the tester to inspect MCP and A2A responses.</pre>
      </div>
    </section>
  </div>

  <div class="float-menu" id="floatMenu">
    <a class="float-link" href="#signals"><strong>Signals</strong><span>Tools and scans</span></a>
    <a class="float-link" href="#maps"><strong>Maps</strong><span>Endpoints and routes</span></a>
    <a class="float-link" href="#console"><strong>Console</strong><span>Live tester</span></a>
  </div>

  <script>
    const sampleToolArgs={token_brief:{token:'ETH'},wallet_risk:{wallet:'fund-alpha'},chain_summary:{network:'ethereum'},signal_feed:{theme:'AI agents'},multi_agent:{task:'wallet rotation review'}};
    async function postJson(body,endpoint){const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return response.json();}
    document.getElementById('initializeBtn').addEventListener('click',async function(){const data=await postJson({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'ui-tester',version:'1.0.0'}}},'/mcp');document.getElementById('output').textContent=JSON.stringify(data,null,2);});
    document.getElementById('toolsBtn').addEventListener('click',async function(){const data=await postJson({jsonrpc:'2.0',id:2,method:'tools/list'},'/mcp');document.getElementById('output').textContent=JSON.stringify(data,null,2);});
    document.getElementById('toolCallBtn').addEventListener('click',async function(){const firstTool='token_brief';const data=await postJson({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:firstTool,arguments:sampleToolArgs[firstTool]}},'/mcp');document.getElementById('output').textContent=JSON.stringify(data,null,2);});
    document.getElementById('resourceBtn').addEventListener('click',async function(){const data=await postJson({jsonrpc:'2.0',id:4,method:'resources/read',params:{uri:'resource://chainscope/chain-metrics'}},'/mcp');document.getElementById('output').textContent=JSON.stringify(data,null,2);});
    document.getElementById('a2aBtn').addEventListener('click',async function(){const data=await postJson({agent:'indexer',task:'wallet rotation review'},'/a2a');document.getElementById('output').textContent=JSON.stringify(data,null,2);});

    const revealNodes=document.querySelectorAll('.reveal');
    const revealObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');}});},{threshold:.18});
    revealNodes.forEach(function(node){revealObserver.observe(node);});

    const floatMenu=document.getElementById('floatMenu');
    window.addEventListener('scroll',function(){if(window.scrollY>260){floatMenu.classList.add('is-visible');}else{floatMenu.classList.remove('is-visible');}});

    const canvas=document.getElementById('particle-field');
    const ctx=canvas.getContext('2d');
    const pointer={x:-9999,y:-9999};
    const particles=[];
    function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
    function createParticles(){particles.length=0;const total=Math.max(48,Math.floor((window.innerWidth*window.innerHeight)/22000));for(let i=0;i<total;i+=1){particles.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*2.8+1.2,hue:[18,38,92][i%3],alpha:Math.random()*.45+.18});}}
    function step(){ctx.clearRect(0,0,canvas.width,canvas.height);for(const p of particles){const dx=p.x-pointer.x;const dy=p.y-pointer.y;const dist=Math.sqrt(dx*dx+dy*dy);if(dist<110){const force=(110-dist)/110;p.vx+=(dx/(dist||1))*force*.18;p.vy+=(dy/(dist||1))*force*.18;}p.x+=p.vx;p.y+=p.vy;p.vx*=.985;p.vy*=.985;if(p.x<-20)p.x=canvas.width+20;if(p.x>canvas.width+20)p.x=-20;if(p.y<-20)p.y=canvas.height+20;if(p.y>canvas.height+20)p.y=-20;ctx.beginPath();ctx.fillStyle='hsla('+p.hue+', 70%, 70%, '+p.alpha+')';ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}requestAnimationFrame(step);}
    window.addEventListener('pointermove',function(event){pointer.x=event.clientX;pointer.y=event.clientY;});
    window.addEventListener('pointerleave',function(){pointer.x=-9999;pointer.y=-9999;});
    window.addEventListener('resize',function(){resize();createParticles();});
    resize();createParticles();step();
  </script>
</body>
</html>`;
}

app.get("/.well-known/agent-card.json", (req, res) => { res.json(buildAgentCard(req)); });
app.get("/mcp", (req, res) => { res.json(getOverview(req)); });
app.post("/mcp", (req, res) => {
  if (req.body?.jsonrpc === "2.0") return handleRpc(req, res);
  const sessionId = getSessionId(req);
  try {
    const result = executeTool(req.body?.tool || profile.tools[0].name, req.body?.input || {}, sessionId);
    return res.json({ output: { profile: profile.id, result: result.content[0].text, agent: profile.name } });
  } catch {
    return res.status(400).json({ output: { profile: profile.id, result: "Recovered from error", agent: profile.name } });
  }
});
app.get("/resources/:resourceName", (req, res) => {
  const resource = profile.resources.find((item) => item.name === req.params.resourceName);
  if (!resource) return res.status(404).json({ error: "Resource not found" });
  return res.json(JSON.parse(readResource(resource.uri).contents[0].text));
});
app.post("/a2a", (req, res) => {
  try { res.json(runA2A(req.body?.agent, req.body?.task, getSessionId(req))); }
  catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "A2A failed" }); }
});
app.get("/", (req, res) => { res.send(buildUi()); });

export default app;
