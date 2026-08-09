/* ==========================================================================
   CHARIS MUSIC COLLECTIVE - Programs & Instruments Loader
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async function() {
  if (document.getElementById('programs-container')) {
    await renderProgramsPage();
  }
  if (document.getElementById('instruments-container')) {
    await renderInstrumentsPage();
  }
});

async function getProgramsData() {
  const settings = await window.CMC_API.getSettings();
  const programs = JSON.parse(localStorage.getItem('cmc_mock_programs') || '[]');
  return programs;
}

async function renderProgramsPage() {
  const container = document.getElementById('programs-container');
  if (!container) return;

  const programs = await getProgramsData();

  let html = '';
  programs.forEach(prog => {
    html += `
      <div class="card program-card" data-category="${prog.name.toLowerCase().includes('guitar') || prog.name.toLowerCase().includes('piano') || prog.name.toLowerCase().includes('bass') ? 'instrument' : 'production'}">
        <div class="program-img-wrap">
          <img src="${prog.image}" alt="${prog.name}" loading="lazy">
          <span class="program-tag">${prog.format}</span>
        </div>
        <div class="program-body">
          <h3>${prog.name}</h3>
          <div class="program-meta">
            <span><i class="fas fa-layer-group text-orange"></i> ${prog.levels}</span>
          </div>
          <p>${prog.desc}</p>
          <ul class="program-features-list">
            <li><i class="fas fa-check-circle"></i> One-on-one personalized sessions</li>
            <li><i class="fas fa-check-circle"></i> Practical & groove-focused lessons</li>
            <li><i class="fas fa-check-circle"></i> Flexible scheduling</li>
          </ul>
          <div style="margin-top: auto; padding-top: 1rem;">
            <a href="student-auth.html?mode=signup&redirect=register&program=${encodeURIComponent(prog.name)}" class="btn btn-primary btn-block">
              REGISTER FOR THIS CLASS <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

async function renderInstrumentsPage() {
  const container = document.getElementById('instruments-container');
  if (!container) return;

  const instruments = [
    {
      name: "Piano",
      icon: "🎹",
      image: "assets/images/piano.png",
      levels: "Beginner → Advanced",
      formats: "Online & In-Person",
      desc: "Learn gospel chords, classic/modern harmonization, modulation, lead melody, and ear training.",
      skills: ["Chord progressions", "Scales & Modes", "Sight reading & Ear training", "Gospel & Modern arrangement"]
    },
    {
      name: "Guitar",
      icon: "🎸",
      image: "assets/images/guitar.png",
      levels: "Beginner → Advanced",
      formats: "Online & In-Person",
      desc: "Master acoustic and electric guitar techniques, chords, lead soloing, rhythm, fingerpicking, and worship tone.",
      skills: ["Open & Barre chords", "Lead guitar solos", "Rhythm & Groove", "Improvisation & Tone setup"]
    },
    {
      name: "Bass",
      icon: "🎸",
      image: "assets/images/bass.png",
      levels: "Beginner → Advanced",
      formats: "Online & In-Person",
      desc: "Build rock-solid bass grooves, finger technique, walking basslines, slap bass fundamentals, and band timing.",
      skills: ["Groove & Timing", "Scales & Walking lines", "Slap & Pop technique", "Rhythm section integration"]
    }
  ];

  let html = '';
  instruments.forEach(inst => {
    html += `
      <div class="card program-card">
        <div class="program-img-wrap">
          <img src="${inst.image}" alt="${inst.name}">
          <span class="program-tag">${inst.formats}</span>
        </div>
        <div class="program-body">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="font-size: 1.8rem;">${inst.icon}</span>
            <h3 style="margin-bottom: 0;">${inst.name}</h3>
          </div>
          <div class="program-meta">
            <span><i class="fas fa-signal text-orange"></i> ${inst.levels}</span>
          </div>
          <p>${inst.desc}</p>
          <div style="margin: 1rem 0;">
            <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--bright-orange);">What You Will Learn:</h4>
            <ul class="program-features-list">
              ${inst.skills.map(s => `<li><i class="fas fa-check text-orange"></i> ${s}</li>`).join('')}
            </ul>
          </div>
          <div style="margin-top: auto; padding-top: 1rem;">
            <a href="student-auth.html?mode=signup&redirect=register&program=${encodeURIComponent(inst.name)}" class="btn btn-primary btn-block">
              CHOOSE THIS INSTRUMENT <i class="fas fa-long-arrow-alt-right"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}
