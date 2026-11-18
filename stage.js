// URL del foglio Google (tab Stage, gid=1684085075)
const URL_STAGE = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTzGJXk3hhRiA4kI_I20kP-OILs719uL9drWRFRz86QLZnP7ZWz5-XpT6GMYiuC7ZLLkWl5rvj0RhBf/pub?gid=1684085075&single=true&output=csv";

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
    // Aggiunge la riga solo se c'è davvero il nome dell'azienda o la relazione (evita card vuote)
    if (oggetto.azienda || oggetto.relazione) {
      oggetti.push(oggetto);
    }
  }
  return oggetti;
}

function mostraErrore(messaggio) {
  const box = document.getElementById("messaggio-errore");
  if (box) {
    box.textContent = messaggio;
    box.hidden = false;
  }
}

function mostraStage(dati) {
  const contenitore = document.getElementById("lista-stage");

  dati.forEach(s => {
    const bloccoStage = document.createElement("section");
    bloccoStage.className = "sezione-card blocco-stage";

    const card = document.createElement("div");
    card.className = "card-stage-info";

    // Legge la colonna "immagine" (es. azienda1.jpg)
    if (s.immagine) {
      const img = document.createElement("img");
      img.src = "img/" + s.immagine;
      img.alt = s.azienda || "Logo azienda";
      img.className = "img-stage";
      card.appendChild(img);
    }

    const dettagli = document.createElement("div");
    dettagli.className = "dettagli-stage";

    if (s.azienda) {
      const titolo = document.createElement("h2");
      titolo.textContent = s.azienda;
      dettagli.appendChild(titolo);
    }

    if (s.luogo) {
      const luogo = document.createElement("p");
      luogo.className = "info-meta";
      luogo.textContent = "Luogo: " + s.luogo;
      dettagli.appendChild(luogo);
    }

    if (s.settore) {
      const settore = document.createElement("p");
      settore.className = "info-meta";
      settore.textContent = "Settore: " + s.settore;
      dettagli.appendChild(settore);
    }

    // Legge sia "attività" (con l'accento come nel foglio) sia "attivita"
    const testoAttivita = s["attività"] || s.attivita;
    if (testoAttivita) {
      const titoloAttivita = document.createElement("h3");
      titoloAttivita.textContent = "Di cosa si occupa:";
      dettagli.appendChild(titoloAttivita);

      const lista = document.createElement("ul");
      const punti = testoAttivita.split(";");

      punti.forEach(punto => {
        const testoPulito = punto.trim();
        if (testoPulito !== "") {
          const li = document.createElement("li");
          li.textContent = testoPulito;
          lista.appendChild(li);
        }
      });

      dettagli.appendChild(lista);
    }

    card.appendChild(dettagli);
    bloccoStage.appendChild(card);

    if (s.relazione) {
      const boxRelazione = document.createElement("div");
      boxRelazione.className = "box-relazione";

      const titoloRelazione = document.createElement("h3");
      titoloRelazione.textContent = "Relazione";

      const testoRelazione = document.createElement("p");
      testoRelazione.className = "testo-relazione";
      testoRelazione.textContent = s.relazione;

      boxRelazione.append(titoloRelazione, testoRelazione);
      bloccoStage.appendChild(boxRelazione);
    }

    contenitore.appendChild(bloccoStage);
  });
}

async function avvia() {
  try {
    const dati = await leggiFoglio(URL_STAGE);
    mostraStage(dati);
  } catch (errore) {
    mostraErrore("Non riesco a caricare i dati dello stage. Verifica il link CSV.");
    console.error(errore);
  }
}

avvia();