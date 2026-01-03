/* The Ontario Will Clinic — SPA for GitHub Pages (hash routing) */

const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

/* ---------- Router ---------- */
const routes = ["home","walkthrough","willinator","simulation","vault"];

function setActiveNav(route){
  $$("[data-nav]").forEach(a => a.classList.toggle("active", a.dataset.nav === route));
}

function showRoute(route){
  if(!routes.includes(route)) route = "home";
  $$("[data-route]").forEach(v => v.hidden = (v.dataset.route !== route));
  setActiveNav(route);
  window.scrollTo({top:0, behavior:"instant" in window ? "instant" : "smooth"});
}

function currentRoute(){
  const h = location.hash.replace("#/","").trim();
  return h || "home";
}

window.addEventListener("hashchange", () => showRoute(currentRoute()));

/* ---------- Mobile nav ---------- */
const hamburger = $("#hamburger");
const mobileNav = $("#mobileNav");

hamburger?.addEventListener("click", () => {
  const open = hamburger.getAttribute("aria-expanded") === "true";
  hamburger.setAttribute("aria-expanded", String(!open));
  mobileNav.hidden = open;
});

mobileNav?.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if(!a) return;
  hamburger.setAttribute("aria-expanded", "false");
  mobileNav.hidden = true;
});

/* ---------- Print helpers ---------- */
$("#btnPrint")?.addEventListener("click", () => window.print());
$("#btnDownload")?.addEventListener("click", () => window.print());

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver((entries) => {
  for(const ent of entries){
    if(ent.isIntersecting){
      ent.target.classList.add("in");
      io.unobserve(ent.target);
    }
  }
}, {threshold: 0.15});

$$(".reveal").forEach(el => io.observe(el));

/* ---------- Walkthrough stepper ---------- */
const steps = [
  {
    title: "Capacity",
    short: "You must understand what a will is and what you own.",
    detail: {
      why: "Capacity protects people from pressure or manipulation. If someone cannot understand the nature of the document, the will can be challenged.",
      do: [
        "Be clear-headed when signing.",
        "Know your main assets and who could reasonably expect to benefit.",
        "If capacity might be questioned, get professional help."
      ],
      mistakes: [
        "Signing when heavily impaired or under pressure.",
        "Major confusion about assets or beneficiaries.",
      ]
    }
  },
  {
    title: "Drafting",
    short: "Write clear roles and clear gifts.",
    detail: {
      why: "Ambiguity creates disputes. A will should clearly name roles (executor, guardians) and explain who receives property.",
      do: [
        "Name an executor and an alternate.",
        "Name beneficiaries and define the residue (everything not specifically listed).",
        "If minors: name guardians/custodians and consider how funds are managed."
      ],
      mistakes: [
        "No alternate executor.",
        "No residue clause (creates confusion).",
        "Using vague wording like “my valuables” without details."
      ]
    }
  },
  {
    title: "Execution",
    short: "Signed at the end; treat it like a formal legal act.",
    detail: {
      why: "Execution formalities exist to prove authenticity. Courts look for clean signing and clear intent.",
      do: [
        "Sign at the end of the document.",
        "Initial pages as a best practice (not the same as signing).",
        "Date the will for clarity."
      ],
      mistakes: [
        "Signature not at the end.",
        "Multiple versions floating around without clarity."
      ]
    }
  },
  {
    title: "Witnessing",
    short: "Most wills require two witnesses present at the same time.",
    detail: {
      why: "Witnesses reduce fraud and help prove the will was signed properly and voluntarily.",
      do: [
        "Use two adult, competent witnesses present together.",
        "Avoid beneficiaries (and spouses of beneficiaries) as witnesses to reduce problems.",
        "Consider an affidavit of execution (common with lawyers) to prove signing later."
      ],
      mistakes: [
        "Beneficiary acts as witness (risk to the gift).",
        "Witnesses not present at the same time.",
        "No way to locate witnesses later."
      ]
    }
  },
  {
    title: "Storing",
    short: "Store the original where your executor can access it.",
    detail: {
      why: "If the original can’t be found, courts may presume revocation. Banks/landlords often want the original.",
      do: [
        "Store the original in a safe place (lawyer, fireproof safe).",
        "Tell your executor where it is and how to access it.",
        "Update your will after major life changes."
      ],
      mistakes: [
        "Only having a photocopy.",
        "Executor has no idea where it is.",
        "Destroying or misplacing the original."
      ]
    }
  }
];

const stepperEl = $("#stepper");
const stepDetailEl = $("#stepDetail");

function renderStepper(activeIndex=0){
  if(!stepperEl || !stepDetailEl) return;
  stepperEl.innerHTML = steps.map((s, i) => `
    <button class="stepBtn ${i===activeIndex ? "active":""}" data-step="${i}">
      <div class="stepTop">
        <div style="display:flex; align-items:center; gap:10px">
          <div class="stepNum">${i+1}</div>
          <div class="stepTitle">${s.title}</div>
        </div>
      </div>
      <div class="stepDesc">${s.short}</div>
    </button>
  `).join("");

  const d = steps[activeIndex].detail;
  stepDetailEl.innerHTML = `
    <h3>${steps[activeIndex].title}</h3>
    <p class="muted">${d.why}</p>
    <div class="docRule"></div>
    <h4 style="margin:0 0 6px; font-size:14px; font-weight:900">What to do</h4>
    <ul class="list">${d.do.map(x=>`<li>${x}</li>`).join("")}</ul>
    <div class="docRule"></div>
    <h4 style="margin:0 0 6px; font-size:14px; font-weight:900">Common mistakes</h4>
    <ul class="list">${d.mistakes.map(x=>`<li>${x}</li>`).join("")}</ul>
  `;
}

stepperEl?.addEventListener("click", (e) => {
  const btn = e.target.closest(".stepBtn");
  if(!btn) return;
  const i = Number(btn.dataset.step);
  renderStepper(i);
});

renderStepper(0);

/* ---------- Will-I-Nator ---------- */
const wi = {
  i: 0,
  answers: {},
  questions: [
    {
      key:"age18",
      title:"Are you 18 or older?",
      help:"In Ontario, most people must be 18+ to make a will (with limited exceptions).",
      choices:[["yes","Yes"],["no","No / not sure"]]
    },
    {
      key:"capacity",
      title:"Do you have testamentary capacity right now?",
      help:"Capacity means you understand what a will is, what you own, and who might expect to benefit.",
      choices:[["yes","Yes"],["no","Not sure / could be questioned"]]
    },
    {
      key:"married",
      title:"Are you legally married?",
      help:"Marriage matters for intestacy and spousal rights. Common-law partners do not automatically inherit on intestacy.",
      choices:[["married","Yes (married)"],["commonlaw","No (common-law)"],["single","No (single)"]]
    },
    {
      key:"children",
      title:"Do you have children under 18 who depend on you?",
      help:"If yes, guardian/custodian clauses become essential.",
      choices:[["yes","Yes"],["no","No"]]
    },
    {
      key:"property",
      title:"Do you own or co-own real property (house/condo) or major assets?",
      help:"Property increases complexity and probate considerations.",
      choices:[["yes","Yes"],["no","No"]]
    },
    {
      key:"specificGifts",
      title:"Do you want to leave specific items to specific people?",
      help:"If yes, add a specific gifts clause (and keep it clear).",
      choices:[["yes","Yes"],["no","No"]]
    },
    {
      key:"pets",
      title:"Do you have pets you want cared for?",
      help:"You can include a pet care clause naming a caregiver and optional funds.",
      choices:[["yes","Yes"],["no","No"]]
    },
    {
      key:"business",
      title:"Do you own a business or expect disputes among family members?",
      help:"This often raises risk and is a strong reason to get legal advice.",
      choices:[["yes","Yes"],["no","No"]]
    },
    {
      key:"poa",
      title:"Do you also need someone to manage finances/health decisions while alive if you become incapable?",
      help:"That’s not a will. It’s a Power of Attorney (property / personal care).",
      choices:[["yes","Yes"],["no","No"]]
    },
    {
      key:"storage",
      title:"Will your executor know where the original will is stored?",
      help:"If the original is missing, courts may presume it was revoked.",
      choices:[["yes","Yes"],["no","No / not planned"]]
    }
  ]
};

const wiBody = $("#wiBody");
const wiNext = $("#wiNext");
const wiBack = $("#wiBack");
const wiProgress = $("#wiProgress");
const wiStepLabel = $("#wiStepLabel");
const wiCountLabel = $("#wiCountLabel");

function wiRender(){
  if(!wiBody) return;

  const q = wi.questions[wi.i];
  const total = wi.questions.length;
  const pct = Math.round(((wi.i) / (total-1)) * 100);

  if(wiProgress) wiProgress.style.width = `${pct}%`;
  if(wiStepLabel) wiStepLabel.textContent = `Step ${wi.i + 1}`;
  if(wiCountLabel) wiCountLabel.textContent = `${wi.i + 1} / ${total}`;

  const current = wi.answers[q.key];

  wiBody.innerHTML = `
    <h2 class="qTitle">${q.title}</h2>
    <p class="qHelp">${q.help}</p>
    <div class="choices">
      ${q.choices.map(([val, label]) => `
        <label class="choice">
          <input type="radio" name="wi_${q.key}" value="${val}" ${current===val ? "checked":""}/>
          <span style="font-weight:900">${label}</span>
        </label>
      `).join("")}
    </div>
  `;

  wiBack.disabled = (wi.i === 0);
  wiNext.textContent = (wi.i === total-1) ? "See Results" : "Next";
}

function wiSelectedValue(){
  const q = wi.questions[wi.i];
  const checked = wiBody?.querySelector(`input[name="wi_${q.key}"]:checked`);
  return checked ? checked.value : null;
}

function wiCompute(){
  const a = wi.answers;
  let score = 0;

  const must = new Map();
  const should = new Map();
  const cautions = [];

  // Baseline clauses
  must.set("Executor + alternate executor", "Names who manages your estate and who takes over if they can’t.");
  must.set("Beneficiaries + residue clause", "States who inherits and what happens to everything not specifically listed.");

  // Age / capacity flags
  if(a.age18 !== "yes") {
    score += 3;
    cautions.push("Most Ontario wills are made by adults (18+). If you are under 18, you may need legal guidance for exceptions.");
  }
  if(a.capacity !== "yes") {
    score += 4;
    should.set("Capacity documentation / professional drafting", "If capacity could be questioned, professional help reduces challenges.");
  }

  // Marriage/common-law
  if(a.married === "married") score += 1;
  if(a.married === "commonlaw") {
    score += 2;
    cautions.push("Common-law partners do not automatically inherit on intestacy. A will is especially important if you are common-law.");
  }

  // Children
  if(a.children === "yes") {
    score += 4;
    must.set("Guardian / custodian clause (minors)", "Names who will care for minor children if both parents cannot.");
    should.set("Trust language for minors", "Explains how funds are managed until children are old enough.");
  }

  // Property
  if(a.property === "yes") {
    score += 2;
    should.set("Clear property/residue wording", "Real estate and major assets increase complexity; be explicit.");
    should.set("Probate planning considerations", "Some assets may require probate; clarity reduces delays.");
  }

  // Specific gifts
  if(a.specificGifts === "yes") {
    score += 1;
    must.set("Specific gifts clause", "Lists specific items and who receives them (keep descriptions clear).");
  }

  // Pets
  if(a.pets === "yes") {
    score += 1;
    should.set("Pet care clause", "Names a caregiver and optional funds or instructions.");
  }

  // Business / disputes
  if(a.business === "yes") {
    score += 4;
    must.set("Revocation clause (replace old wills)", "Ensures older wills are revoked to avoid conflicts.");
    should.set("Professional review", "Businesses and disputes raise the risk of litigation—legal advice is strongly recommended.");
  }

  // POA
  if(a.poa === "yes") {
    should.set("Power of Attorney (property/personal care)", "A will only works after death; POA covers incapacity while alive.");
  }

  // Storage
  if(a.storage !== "yes") {
    score += 2;
    must.set("Storage plan", "Store the original will safely and tell the executor where it is.");
    cautions.push("If the original can’t be found, courts may presume it was revoked. Plan storage now.");
  }

  // Witnessing guidance (always relevant)
  must.set("Proper signing + witnessing plan", "Most wills require two witnesses present at the same time. Avoid beneficiaries as witnesses for clean execution.");
  should.set("Affidavit of execution (best practice)", "Helps prove the will was signed properly if witnesses can’t be located later.");

  // Risk tiers
  let tier = "Low";
  if(score >= 8) tier = "High";
  else if(score >= 4) tier = "Medium";

  return { score, tier, must, should, cautions };
}

function wiRenderResults(){
  const r = wiCompute();
  const badgeClass = r.tier === "High" ? "high" : (r.tier === "Medium" ? "med" : "low");

  wiBody.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px">
      <h2 class="qTitle" style="margin:0">Your Risk Profile</h2>
      <span class="badge ${badgeClass}">${r.tier} complexity</span>
    </div>
    <p class="qHelp">Below are the clauses you should include to make your will clearer and harder to challenge.</p>

    <div class="docRule"></div>
    <h3 style="margin:0 0 8px; font-size:14px; font-weight:900">Must include</h3>
    <div class="choices">
      ${Array.from(r.must.entries()).map(([k,v]) => `
        <div class="choice" style="cursor:default">
          <div>
            <div style="font-weight:900">${k}</div>
            <div style="color: rgba(230,237,247,.70); margin-top:4px; line-height:1.6">${v}</div>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="docRule"></div>
    <h3 style="margin:0 0 8px; font-size:14px; font-weight:900">Strongly recommended</h3>
    <div class="choices">
      ${Array.from(r.should.entries()).map(([k,v]) => `
        <div class="choice" style="cursor:default">
          <div>
            <div style="font-weight:900">${k}</div>
            <div style="color: rgba(230,237,247,.70); margin-top:4px; line-height:1.6">${v}</div>
          </div>
        </div>
      `).join("") || `<div class="muted">No extras recommended based on your answers.</div>`}
    </div>

    ${r.cautions.length ? `
      <div class="docRule"></div>
      <h3 style="margin:0 0 8px; font-size:14px; font-weight:900">Cautions</h3>
      <ul class="list">${r.cautions.map(c=>`<li>${c}</li>`).join("")}</ul>
    ` : ""}

    <div class="note">
      Next step: try the Simulation page to see how these clauses appear in a clean will format.
    </div>
  `;

  wiBack.disabled = false;
  wiNext.textContent = "Restart";
}

function wiSaveAnswer(){
  const q = wi.questions[wi.i];
  const val = wiSelectedValue();
  if(!val) return false;
  wi.answers[q.key] = val;
  return true;
}

wiNext?.addEventListener("click", () => {
  // If at results state
  if(wiNext.textContent === "Restart"){
    wi.i = 0;
    wi.answers = {};
    wiRender();
    return;
  }

  if(!wiSaveAnswer()){
    // soft prompt
    wiBody?.insertAdjacentHTML("beforeend", `<div class="note">Pick an option to continue.</div>`);
    return;
  }

  if(wi.i === wi.questions.length - 1){
    wiRenderResults();
    return;
  }

  wi.i += 1;
  wiRender();
});

wiBack?.addEventListener("click", () => {
  if(wi.i === 0) return;
  wi.i -= 1;
  wiRender();
});

wiBody?.addEventListener("change", () => {
  // Optional live-save feel
});

wiRender();

/* ---------- Simulation: live preview ---------- */
const simForm = $("#simForm");
const previewDoc = $("#previewDoc");

function safeList(str){
  return (str || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

function todayISO(){
  const d = new Date();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function renderPreview(data){
  const name = data.testatorName || "[Testator Name]";
  const city = data.testatorCity || "[Ontario City]";
  const executor = data.executorName || "[Executor Name]";
  const altExec = data.altExecutorName || "";
  const bens = safeList(data.beneficiaries);
  const specificGift = data.specificGift || "";
  const hasMinors = data.hasMinors === "yes";
  const guardian = data.guardianName || "";
  const pet = data.petClause || "";
  const storage = data.storageNote || "";

  const bensText = bens.length ? bens.map((b,i)=>`${i+1}. ${b}`).join("<br/>") : "[Beneficiaries]";

  const altText = altExec
    ? `<p class="docP"><strong>Alternate Executor.</strong> If ${executor} cannot or will not act, I appoint ${altExec} as my alternate executor.</p>`
    : "";

  const specificText = specificGift
    ? `<p class="docP"><strong>Specific Gift.</strong> I give the following specific gift: ${specificGift}.</p>`
    : "";

  const guardianText = hasMinors
    ? `<p class="docP"><strong>Guardianship.</strong> If I have minor children at my death, I appoint ${guardian || "[Guardian Name]"} as guardian/custodian. If they cannot act, I request that the court consider my alternate wishes (to be stated in a full will).</p>
       <p class="docP"><em>Note:</em> guardianship and management of funds can be complex. Professional drafting is recommended for minors.</p>`
    : "";

  const petText = pet
    ? `<p class="docP"><strong>Pet Care.</strong> I request that ${pet}.</p>`
    : "";

  const storageText = storage
    ? `<p class="docP"><strong>Storage.</strong> I have stored the original will at: ${storage}. I have told my executor how to access it.</p>`
    : `<p class="docP"><strong>Storage.</strong> Store the original will safely and tell your executor where it is.</p>`;

  const doc = `
    <div class="docH">Last Will and Testament (Educational Draft)</div>
    <div class="docMeta">Made in ${city}, Ontario • Date: ${todayISO()}</div>
    <div class="docRule"></div>

    <p class="docP"><strong>1. Declaration.</strong> I, ${name}, declare this to be my last will and testament. I revoke all prior wills and codicils to the extent I am permitted by law.</p>

    <p class="docP"><strong>2. Executor.</strong> I appoint ${executor} as my executor (estate trustee) to administer my estate, pay debts and taxes, and distribute my property according to this will.</p>
    ${altText}

    ${specificText}

    <p class="docP"><strong>3. Beneficiaries and Residue.</strong> After payment of debts, taxes, and expenses, I give the residue of my estate to the following beneficiary(ies):</p>
    <p class="docP" style="padding-left:10px">${bensText}</p>

    ${guardianText}
    ${petText}

    <p class="docP"><strong>4. Execution.</strong> I intend to sign this will at the end, in accordance with Ontario requirements. Most wills require two witnesses present at the same time. Beneficiaries should not act as witnesses.</p>

    ${storageText}

    <div class="docRule"></div>
    <div class="docSigGrid">
      <div class="sigLine">Testator signature</div>
      <div class="sigLine">Date</div>
    </div>

    <div class="docSigGrid">
      <div class="sigLine">Witness #1 signature (adult, competent)</div>
      <div class="sigLine">Witness #2 signature (adult, competent)</div>
    </div>

    <p class="docP" style="margin-top:14px; color: rgba(226,232,240,.70); font-size:12.5px">
      Educational template only. Complex situations should be reviewed with a lawyer.
    </p>
  `;

  if(previewDoc) previewDoc.innerHTML = doc;
}

function readForm(){
  const fd = new FormData(simForm);
  const obj = {};
  for(const [k,v] of fd.entries()) obj[k]=String(v||"");
  return obj;
}

simForm?.addEventListener("input", () => renderPreview(readForm()));
simForm?.addEventListener("change", () => renderPreview(readForm()));
renderPreview(readForm());

/* ---------- Legal Vault ---------- */
const vaultData = {
  forms: [
    {
      title: "Form 74.4 — Application for Certificate of Appointment of Estate Trustee (With a Will)",
      desc: "Core probate application form (Superior Court of Justice) when there is a will.",
      meta: "Ontario Court Forms (PDF)",
      links: [
        { label:"Open PDF", href:"https://ontariocourtforms.on.ca/static/media/uploads/courtforms/civil/74_04/rcp-74-4-e.pdf" }
      ]
    },
    {
      title: "Estates forms directory (Rules 74 / 75)",
      desc: "Official directory for pre-formatted, fillable estates forms (probate / estate trustee).",
      meta: "Ontario Court Forms",
      links: [
        { label:"Open directory", href:"https://ontariocourtforms.on.ca/en/rules-of-civil-procedure-forms/pre-formatted-fillable-estates-forms/" }
      ]
    }
  ],
  guides: [
    {
      title: "Law Society Referral Service (LSRS)",
      desc: "Find a lawyer/paralegal referral and next steps. Useful for complex wills or disputes.",
      meta: "Law Society of Ontario",
      links: [
        { label:"Open LSRS", href:"https://lso.ca/public-resources/finding-a-lawyer-or-paralegal/law-society-referral-service" }
      ]
    },
    {
      title: "Power of Attorney (Ontario overview)",
      desc: "If you need someone to manage finances/health decisions while you’re alive, you need a Power of Attorney (not a will).",
      meta: "Ontario resource",
      links: [
        { label:"Open guide", href:"https://www.ontario.ca/page/make-power-attorney" }
      ]
    }
  ],
  help: [
    {
      title: "Steps to Justice — Wills and Powers of Attorney",
      desc: "Plain-language legal education and step-by-step help.",
      meta: "CLEO / Steps to Justice",
      links: [
        { label:"Open", href:"https://stepstojustice.ca/legal-topic/wills-and-powers-of-attorney/" }
      ]
    },
    {
      title: "FindLegalHelp.ca (LSRS intake)",
      desc: "Online intake path mentioned by the Law Society Referral Service.",
      meta: "LSO referral intake",
      links: [
        { label:"Open", href:"https://www.findlegalhelp.ca/" }
      ]
    }
  ],
  glossary: [
    { term:"Testator", def:"The person who makes the will." },
    { term:"Executor (Estate Trustee)", def:"The person responsible for administering the estate after death." },
    { term:"Beneficiary", def:"A person or organization who receives property under the will." },
    { term:"Residue", def:"Everything left after debts, taxes, and specific gifts are handled." },
    { term:"Intestacy", def:"Dying without a valid will; Ontario law decides distribution." },
    { term:"Probate", def:"A court process that confirms a will and gives authority to the estate trustee." },
    { term:"Holograph will", def:"A will wholly handwritten and signed by the testator; may not require witnesses if it meets the legal definition." },
    { term:"Affidavit of execution", def:"A sworn document by a witness confirming proper signing; helps prove validity later." }
  ]
};

const vaultSearch = $("#vaultSearch");
const vaultTabs = $("#vaultTabs");
const vaultList = $("#vaultList");

let vaultState = { tab:"forms", q:"" };

function vaultItems(){
  const tab = vaultState.tab;
  const q = vaultState.q.toLowerCase().trim();
  let items = vaultData[tab] || [];

  if(tab === "glossary"){
    items = vaultData.glossary.map(g => ({
      title: g.term,
      desc: g.def,
      meta: "Glossary",
      links: []
    }));
  }

  if(!q) return items;

  return items.filter(it => {
    const hay = `${it.title} ${it.desc} ${it.meta}`.toLowerCase();
    return hay.includes(q);
  });
}

function renderVault(){
  if(!vaultList) return;
  const items = vaultItems();

  vaultList.innerHTML = items.length ? items.map(it => `
    <div class="item">
      <div class="itemTop">
        <div>
          <div class="itemTitle">${it.title}</div>
          <div class="itemDesc">${it.desc}</div>
          <div class="itemMeta">${it.meta}</div>
        </div>
      </div>
      ${it.links && it.links.length ? `
        <div class="itemActions">
          ${it.links.map(l => `<a class="linkBtn" href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`).join("")}
        </div>
      ` : ""}
    </div>
  `).join("") : `<div class="muted">No results. Try a different keyword.</div>`;
}

vaultSearch?.addEventListener("input", () => {
  vaultState.q = vaultSearch.value || "";
  renderVault();
});

vaultTabs?.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if(!btn) return;
  $$(".tab", vaultTabs).forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  vaultState.tab = btn.dataset.tab;
  renderVault();
});

renderVault();

/* ---------- Boot ---------- */
showRoute(currentRoute());
