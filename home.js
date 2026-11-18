// ==========================================================================
// 1. CONFIGURAZIONE LINK GOOGLE SHEETS (CSV)
// ==========================================================================
const URL_HOME = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTzGJXk3hhRiA4kI_I20kP-OILs719uL9drWRFRz86QLZnP7ZWz5-XpT6GMYiuC7ZLLkWl5rvj0RhBf/pub?gid=0&single=true&output=csv";

// Dati esatti del tuo foglio Home (usati automaticamente se gid=0 punta al CV)
const DATI_HOME_BACKUP = [
  {
    sezione: "presentazione",
    titolo: "Kevin Parisi",
    sottotitolo: "Operatore informatico",
    testo: "Sono Kevin, vivo a Monza e studio informatica presso l'istituto Immaginazione e Lavoro di Milano, dove sono arrivato al terzo anno. In questi anni ho acquisito esperienza nella programmazione con linguaggi come HTML, CSS, JavaScript, C++ e Python. Ho avuto l'opportunità di svolgere uno stage di 3 mesi presso un'azienda specializzata in assistenza e riparazione di qualsiasi tipo di dispositivo tecnologico (smartphone, PC, tablet).",
    immagine: "foto per cv.jpg"
  },
  {
    sezione: "passione",
    titolo: "Fitness",
    testo: "Mi piace molto questo sport perchè è molto autonomo e ti responsabilizza",
    immagine: "passione1.jpg"
  },
  {
    sezione: "passione",
    titolo: "Gaming",
    testo: "Amo molto i videogiochi e il mondo del gaming",
    immagine: "passione2.jpg"
  },
  {
    sezione: "passione",
    titolo: "Lavori tecnici e manuali",
    testo: "Fare e finire un lavoro tecnico mi soddisfa molto",
    immagine: "passione3.webp"
  },
  {
    sezione: "competenza",
    titolo: "HTML",
    livello: "80"
  },
  {
    sezione: "competenza",
    titolo: "CSS",
    livello: "70"
  },
  {
    sezione: "competenza",
    titolo: "JavaScript",
    livello: "50"
  }
];

// ==========================================================================
// 2. GESTIONE TRANSIZIONE PAGINA E ACCORDION "CHI SONO"
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-loaded");

  const toggleBtn = document.getElementById("toggle-chi-sono");
  const contenutoChiSono = document.getElementById("contenuto-chi-sono");
  const freccia = document.getElementById("icona-freccia");

  if (toggleBtn && contenutoChiSono) {
    toggleBtn.addEventListener("click", () => {
      contenutoChiSono.classList.toggle("aperto");
      if (freccia) freccia.classList.toggle("ruotata");
    });
  }

  avviaHome();
});

// ==========================================================================
// 3. LETTURA E PARSING DEL CSV
// ==========================================================================
async function leggiFoglio(url) {
  const risposta = await fetch(url);
  if (!risposta.ok) {
    throw new Error("Errore nel download: " + risposta.status);
  }
  const testo = await risposta.text();
  return csvInOggetti(testo);
}

function csvInOggetti(testo) {
  const righe = [];
  let riga = [];
  let cella = "";
  let traVirgolette = false;

  for (const c of testo) {
    if (c === '"') {
      traVirgolette = !traVirgolette;
    } else if (c === "," && !traVirgolette) {
      riga.push(cella);
      cella = "";
    } else if (c === "\n" && !traVirgolette) {
      riga.push(cella);
      righe.push(riga);
      riga = [];
      cella = "";
    } else if (c !== "\r") {
      cella += c;
    }
  }
  riga.push(cella);
  righe.push(riga);

  const intestazioni = righe[0].map(nome => nome.trim().toLowerCase());
  const oggetti = [];
  for (let i = 1; i < righe.length; i++) {
    const oggetto = {};
    intestazioni.forEach((nome, posizione) => {
      oggetto[nome] = (righe[i][posizione] || "").trim();
    });
    oggetti.push(oggetto);
  }
  return oggetti;
}

//// ==========================================================================
// 4. CREAZIONE PRESENTAZIONE, PASSIONI (CON FOTO) E BARRE COMPETENZE
// ==========================================================================
function mostraHome(dati) {
  const contPassioni = document.getElementById("lista-passioni");
  const contCompetenze = document.getElementById("lista-competenze");

  if (contPassioni) {
    contPassioni.innerHTML = "";
    contPassioni.classList.add("grid-passioni");
  }
  if (contCompetenze) {
    contCompetenze.innerHTML = "";
  }

  dati.forEach(riga => {
    const sezione = (riga.sezione || "").toLowerCase();

    // SEZIONE PRESENTAZIONE
    if (sezione === "presentazione") {
      if (riga.titolo && document.getElementById("nome")) {
        document.getElementById("nome").textContent = riga.titolo;
      }
      if (riga.sottotitolo && document.getElementById("qualifica")) {
        document.getElementById("qualifica").textContent = riga.sottotitolo;
      }
      if (riga.testo && document.getElementById("testo-chi-sono")) {
        document.getElementById("testo-chi-sono").textContent = riga.testo;
      }
      if (riga.immagine && document.getElementById("foto")) {
        document.getElementById("foto").src = "img/" + riga.immagine;
      }
    }
    // SEZIONE PASSIONI (con immagine)
    else if (sezione === "passioni" || sezione === "passione") {
      const card = document.createElement("div");
      card.className = "card-passione";

      const nomeImg = riga.immagine || riga.foto;
      if (nomeImg) {
        const img = document.createElement("img");
        img.src = nomeImg.startsWith("http") ? nomeImg : "img/" + nomeImg;
        img.alt = riga.titolo || "Passione";
        img.className = "img-passione";
        card.appendChild(img);
      }

      if (riga.titolo) {
        const h3 = document.createElement("h3");
        h3.textContent = riga.titolo;
        card.appendChild(h3);
      }

      if (riga.testo || riga.descrizione) {
        const p = document.createElement("p");
        p.textContent = riga.testo || riga.descrizione;
        card.appendChild(p);
      }

      if (contPassioni) contPassioni.appendChild(card);
    }

    // SEZIONE COMPETENZE ("Cosa so fare" con barra percentuale)
    else if (sezione === "competenze" || sezione === "competenza" || sezione === "skill") {
      const barraWrapper = document.createElement("div");
      barraWrapper.className = "barra-skill";

      const info = document.createElement("div");
      info.className = "info-skill";

      const nomeSkill = document.createElement("span");
      nomeSkill.textContent = riga.titolo || riga.nome;

      let valore = (riga.livello || riga.percentuale || riga.testo || "0").replace("%", "").trim();
      const percTesto = document.createElement("span");
      percTesto.textContent = valore + "%";

      info.append(nomeSkill, percTesto);

      const sfondoBarra = document.createElement("div");
      sfondoBarra.className = "sfondo-barra";

      const riempimento = document.createElement("div");
      riempimento.className = "riempimento-barra";

      sfondoBarra.appendChild(riempimento);
      barraWrapper.append(info, sfondoBarra);
      if (contCompetenze) contCompetenze.appendChild(barraWrapper);

   setTimeout(() => {
  riempimento.style.width = valore + "%";
}, 150);