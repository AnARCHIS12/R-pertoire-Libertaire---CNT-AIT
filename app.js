/* ==========================================================================
   Répertoire Libertaire - Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // App State
  let filteredData = [...LIBERTAIRE_DATA];
  let favorites = JSON.parse(localStorage.getItem('libertaire_favs') || '[]');
  let currentView = 'grid'; // 'grid' | 'table' | 'map'
  let activePill = null;
  let showOnlyFavorites = false;
  let mapInstance = null;
  let markerClusterGroup = null;

  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const orgFilter = document.getElementById('orgFilter');
  const typeFilter = document.getElementById('typeFilter');
  const countryFilter = document.getElementById('countryFilter');
  const sortBy = document.getElementById('sortBy');
  const gridView = document.getElementById('gridView');
  const tableView = document.getElementById('tableView');
  const tableBody = document.getElementById('tableBody');
  const mapView = document.getElementById('mapView');
  const emptyState = document.getElementById('emptyState');
  const visibleCount = document.getElementById('visibleCount');
  const favCount = document.getElementById('favCount');
  const statFilteredCount = document.getElementById('statFilteredCount');
  const toggleFavoritesBtn = document.getElementById('toggleFavoritesBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');

  // Modal Elements
  const detailModal = document.getElementById('detailModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalOrgBadge = document.getElementById('modalOrgBadge');
  const modalTitle = document.getElementById('modalTitle');
  const modalType = document.getElementById('modalType');
  const modalVille = document.getElementById('modalVille');
  const modalAdresse = document.getElementById('modalAdresse');
  const modalContactLink = document.getElementById('modalContactLink');
  const copyModalEmailBtn = document.getElementById('copyModalEmailBtn');
  const modalPage = document.getElementById('modalPage');
  const modalFavBtn = document.getElementById('modalFavBtn');
  let currentModalItem = null;

  // Organization Badge Classes
  function getOrgClass(org) {
    if (!org) return 'badge-org-indep';
    if (org.includes('CNT-AIT')) return 'badge-org-cnt-ait';
    if (org.includes('Fédération anarchiste') || org.includes('(FA)')) return 'badge-org-fa';
    if (org.includes('UCL')) return 'badge-org-ucl';
    if (org.includes('CNT-F')) return 'badge-org-cnt-f';
    if (org.includes('CNT-SO')) return 'badge-org-cnt-so';
    if (org.includes('Organisation Anarchiste')) return 'badge-org-oa';
    if (org.includes('OCL')) return 'badge-org-ocl';
    return 'badge-org-indep';
  }

  function getMarkerColor(org) {
    if (org.includes('CNT-AIT')) return '#ef4444';
    if (org.includes('FA') || org.includes('Fédération')) return '#dc2626';
    if (org.includes('UCL')) return '#71717a';
    if (org.includes('CNT-F')) return '#b91c1c';
    if (org.includes('CNT-SO')) return '#52525b';
    if (org.includes('OA')) return '#f87171';
    return '#8e8e93';
  }

  // Initial Setup
  updateFavCount();
  applyFilters();

  // Event Listeners
  searchInput.addEventListener('input', applyFilters);
  orgFilter.addEventListener('change', applyFilters);
  typeFilter.addEventListener('change', applyFilters);
  countryFilter.addEventListener('change', applyFilters);
  sortBy.addEventListener('change', applyFilters);
  resetFiltersBtn.addEventListener('click', resetAllFilters);

  // View Switchers
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetView = e.currentTarget.getAttribute('data-view');
      switchView(targetView);
    });
  });

  // Quick Filter Pills
  document.querySelectorAll('.pill-btn[data-pill]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pillVal = e.currentTarget.getAttribute('data-pill');
      if (activePill === pillVal) {
        activePill = null;
        btn.classList.remove('active');
      } else {
        document.querySelectorAll('.pill-btn').forEach(p => p.classList.remove('active'));
        activePill = pillVal;
        btn.classList.add('active');
      }
      applyFilters();
    });
  });

  // Toggle Favorites Only Filter
  toggleFavoritesBtn.addEventListener('click', () => {
    showOnlyFavorites = !showOnlyFavorites;
    toggleFavoritesBtn.classList.toggle('btn-primary', showOnlyFavorites);
    applyFilters();
  });

  // Export CSV
  exportCsvBtn.addEventListener('click', exportToCsv);

  // Theme Toggle
  themeToggleBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    if (mapInstance) renderMapView();
  });

  // Modal Close
  closeModalBtn.addEventListener('click', closeModal);
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) closeModal();
  });

  copyModalEmailBtn.addEventListener('click', () => {
    if (currentModalItem && currentModalItem.contact) {
      navigator.clipboard.writeText(currentModalItem.contact);
      copyModalEmailBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
      setTimeout(() => {
        copyModalEmailBtn.innerHTML = '<i class="fa-solid fa-copy"></i>';
      }, 1500);
    }
  });

  modalFavBtn.addEventListener('click', () => {
    if (currentModalItem) {
      toggleFavorite(currentModalItem.id);
      updateModalFavBtnState();
      renderCurrentView();
    }
  });

  // Filter & Sort Core Logic
  function applyFilters() {
    const query = searchInput.value ? searchInput.value.toLowerCase().trim() : '';
    const selOrg = orgFilter.value;
    const selType = typeFilter.value;
    const selCountry = countryFilter.value;

    filteredData = LIBERTAIRE_DATA.filter(item => {
      // Search term
      if (query) {
        const matchesName = item.nom.toLowerCase().includes(query);
        const matchesOrg = item.organisation.toLowerCase().includes(query);
        const matchesVille = item.ville.toLowerCase().includes(query);
        const matchesContact = item.contact.toLowerCase().includes(query);
        const matchesAdresse = item.adresse.toLowerCase().includes(query);
        const matchesType = item.type.toLowerCase().includes(query);
        if (!matchesName && !matchesOrg && !matchesVille && !matchesContact && !matchesAdresse && !matchesType) {
          return false;
        }
      }

      // Org Filter
      if (selOrg !== 'ALL' && item.organisation !== selOrg) {
        return false;
      }

      // Type Filter
      if (selType !== 'ALL') {
        if (selType === 'Section / groupe' && !item.type.includes('Section')) return false;
        else if (selType !== 'Section / groupe' && !item.type.includes(selType)) return false;
      }

      
      const belgianCities = ['Belgique', 'Bruxelles', 'Anvers', 'Bruges', 'Courtrai', 'Louvain', 'Gand'];
      const isBelgian = item.ville.includes('Belgique') || item.organisation.includes('Belgique') || belgianCities.some(c => item.ville.includes(c));

      if (selCountry === 'BE' && !isBelgian) {
        return false;
      }
      if (selCountry === 'FR' && isBelgian) {
        return false;
      }

      if (activePill) {
        if (activePill === 'cnt-ait' && !item.organisation.includes('CNT-AIT')) return false;
        if (activePill === 'fa' && !item.organisation.includes('Fédération anarchiste')) return false;
        if (activePill === 'ucl' && !item.organisation.includes('UCL')) return false;
        if (activePill === 'cnt-f' && !item.organisation.includes('CNT-F')) return false;
        if (activePill === 'cnt-so' && !item.organisation.includes('CNT-SO')) return false;
        if (activePill === 'belgique' && !isBelgian) return false;
        if (activePill === 'locaux' && !['Local', 'Librairie', 'Collectif'].includes(item.type)) return false;
      }

      if (showOnlyFavorites && !favorites.includes(item.id)) {
        return false;
      }

      return true;
    });

    // Sorting
    const sortMode = sortBy.value;
    filteredData.sort((a, b) => {
      if (sortMode === 'nom-asc') return a.nom.localeCompare(b.nom);
      if (sortMode === 'nom-desc') return b.nom.localeCompare(a.nom);
      if (sortMode === 'org-asc') return a.organisation.localeCompare(b.organisation);
      if (sortMode === 'ville-asc') return a.ville.localeCompare(b.ville);
      return 0;
    });

    // Update Counters
    visibleCount.textContent = filteredData.length;
    statFilteredCount.textContent = filteredData.length;

    // Toggle Empty State
    if (filteredData.length === 0) {
      emptyState.classList.remove('hidden');
      gridView.classList.add('hidden');
      tableView.classList.add('hidden');
      mapView.classList.add('hidden');
    } else {
      emptyState.classList.add('hidden');
      renderCurrentView();
    }
  }

  function resetAllFilters() {
    searchInput.value = '';
    orgFilter.value = 'ALL';
    typeFilter.value = 'ALL';
    countryFilter.value = 'ALL';
    sortBy.value = 'nom-asc';
    activePill = null;
    showOnlyFavorites = false;
    toggleFavoritesBtn.classList.remove('btn-primary');
    document.querySelectorAll('.pill-btn').forEach(p => p.classList.remove('active'));
    applyFilters();
  }

  // Switch View (Grid / Table / Map)
  function switchView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === view);
    });

    gridView.classList.toggle('hidden', view !== 'grid');
    tableView.classList.toggle('hidden', view !== 'table');
    mapView.classList.toggle('hidden', view !== 'map');

    if (filteredData.length > 0) {
      renderCurrentView();
    }
  }

  function renderCurrentView() {
    if (currentView === 'grid') renderGridView();
    else if (currentView === 'table') renderTableView();
    else if (currentView === 'map') renderMapView();
  }

  // Render Cards Grid View
  function renderGridView() {
    gridView.innerHTML = '';

    filteredData.forEach(item => {
      const isFav = favorites.includes(item.id);
      const orgClass = getOrgClass(item.organisation);

      const card = document.createElement('div');
      card.className = 'entry-card';
      card.innerHTML = `
        <div class="card-top">
          <div class="card-badges">
            <span class="badge ${orgClass}">${escapeHtml(item.organisation)}</span>
            <div style="display: flex; gap: 0.4rem; align-items: center;">
              <span class="badge badge-type">${escapeHtml(item.type || 'Structure')}</span>
              <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${item.id}" title="Ajouter aux favoris">
                <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
              </button>
            </div>
          </div>
          
          <h3 class="card-title">${escapeHtml(item.nom)}</h3>

          ${item.ville ? `<div class="card-location"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.ville)}</div>` : ''}
        </div>

        <div class="card-body-info">
          ${item.contact ? `
            <div class="info-item">
              <i class="fa-solid fa-envelope"></i>
              <span>${formatContactLink(item.contact)}</span>
            </div>
          ` : ''}

          ${item.adresse && item.adresse !== '—' ? `
            <div class="info-item">
              <i class="fa-solid fa-map-pin"></i>
              <span>${escapeHtml(item.adresse)}</span>
            </div>
          ` : ''}
        </div>

        <div class="card-actions">
          <button class="btn btn-sm view-details-btn" data-id="${item.id}">
            <i class="fa-solid fa-eye"></i> Détails
          </button>
          
          ${item.contact && item.contact.includes('@') ? `
            <a href="mailto:${item.contact}" class="btn btn-sm btn-primary">
              <i class="fa-solid fa-paper-plane"></i> Contact
            </a>
          ` : ''}
        </div>
      `;

      card.querySelector('.view-details-btn').addEventListener('click', () => openModal(item));
      card.querySelector('.fav-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(item.id);
        applyFilters();
      });

      gridView.appendChild(card);
    });
  }

  // Render Table View
  function renderTableView() {
    tableBody.innerHTML = '';

    filteredData.forEach((item, index) => {
      const isFav = favorites.includes(item.id);
      const orgClass = getOrgClass(item.organisation);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: var(--text-muted); font-size: 0.8rem;">${index + 1}</td>
        <td><span class="badge ${orgClass}">${escapeHtml(item.organisation)}</span></td>
        <td><strong>${escapeHtml(item.nom)}</strong></td>
        <td><i class="fa-solid fa-location-dot" style="color: var(--accent-red); margin-right: 4px;"></i> ${escapeHtml(item.ville || '—')}</td>
        <td>${formatContactLink(item.contact)}</td>
        <td style="font-size: 0.82rem;">${escapeHtml(item.adresse || '—')}</td>
        <td><span class="badge badge-type">${escapeHtml(item.type || 'Structure')}</span></td>
        <td>
          <div style="display: flex; gap: 0.35rem;">
            <button class="btn btn-icon view-details-btn" data-id="${item.id}" title="Voir détails"><i class="fa-solid fa-eye"></i></button>
            <button class="btn btn-icon fav-btn ${isFav ? 'active' : ''}" data-id="${item.id}" title="Favori"><i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i></button>
          </div>
        </td>
      `;

      tr.querySelector('.view-details-btn').addEventListener('click', () => openModal(item));
      tr.querySelector('.fav-btn').addEventListener('click', () => {
        toggleFavorite(item.id);
        applyFilters();
      });

      tableBody.appendChild(tr);
    });
  }

  // Render Map View (Leaflet with MarkerCluster & Jitter to display ALL 111 sections)
  function renderMapView() {
    if (!mapInstance) {
      mapInstance = L.map('map').setView([46.603354, 1.888334], 6);

      // CartoDB Dark Matter Tile Layer (Strict Rouge et Noir aesthetic)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19
      }).addTo(mapInstance);
    }

    if (markerClusterGroup) {
      mapInstance.removeLayer(markerClusterGroup);
    }

    // Initialize Marker Cluster with Spiderfy enabled so ALL markers in same city expand nicely
    markerClusterGroup = L.markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 40
    });

    // Group items by coordinate to add tiny jitter for duplicate exact lat/lng
    const coordCounts = {};

    filteredData.forEach(item => {
      if (item.lat && item.lng) {
        const key = `${item.lat.toFixed(4)}_${item.lng.toFixed(4)}`;
        coordCounts[key] = (coordCounts[key] || 0) + 1;
        const count = coordCounts[key];

        // Apply a small deterministic spiral offset if multiple items share the exact same location
        let finalLat = item.lat;
        let finalLng = item.lng;
        if (count > 1) {
          const angle = (count - 1) * 0.8;
          const radius = 0.004 * (1 + (count * 0.15));
          finalLat += radius * Math.cos(angle);
          finalLng += radius * Math.sin(angle);
        }

        const markerColor = getMarkerColor(item.organisation);

        const circleMarker = L.circleMarker([finalLat, finalLng], {
          radius: 8,
          fillColor: markerColor,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        });

        const popupContent = `
          <div class="map-popup-card">
            <span style="background: var(--accent-red); color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase;">${escapeHtml(item.organisation)}</span>
            <h4 style="margin-top: 6px; font-size: 14px; font-weight: 700; color: #ffffff;">${escapeHtml(item.nom)}</h4>
            <p style="margin: 4px 0;"><i class="fa-solid fa-location-dot" style="color: var(--accent-red);"></i> ${escapeHtml(item.ville)}</p>
            ${item.contact ? `<p style="margin: 4px 0;"><i class="fa-solid fa-envelope" style="color: var(--accent-red);"></i> ${escapeHtml(item.contact)}</p>` : ''}
            <button onclick="window.openDetailModal(${item.id})" style="background: linear-gradient(135deg, #dc2626, #991b1b); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600; margin-top: 6px; width: 100%;">Voir détails complets</button>
          </div>
        `;

        circleMarker.bindPopup(popupContent);
        markerClusterGroup.addLayer(circleMarker);
      }
    });

    mapInstance.addLayer(markerClusterGroup);

    // Fit bounds automatically so all sections are visible on screen
    if (filteredData.length > 0 && markerClusterGroup.getBounds().isValid()) {
      mapInstance.fitBounds(markerClusterGroup.getBounds().pad(0.1));
    }

    setTimeout(() => mapInstance.invalidateSize(), 200);
  }

  // Modal Functions
  window.openDetailModal = function(id) {
    const item = LIBERTAIRE_DATA.find(x => x.id === id);
    if (item) openModal(item);
  };

  function openModal(item) {
    currentModalItem = item;
    modalTitle.textContent = item.nom;
    modalOrgBadge.textContent = item.organisation;
    modalOrgBadge.className = `badge ${getOrgClass(item.organisation)}`;
    modalType.textContent = item.type || '—';
    modalVille.textContent = item.ville || '—';
    modalAdresse.textContent = item.adresse || '—';
    modalPage.textContent = `Page ${item.page} du document PDF CNT-AIT`;

    if (item.contact) {
      if (item.contact.includes('@')) {
        modalContactLink.href = `mailto:${item.contact}`;
        modalContactLink.textContent = item.contact;
      } else {
        modalContactLink.href = item.contact.startsWith('http') ? item.contact : `https://${item.contact}`;
        modalContactLink.textContent = item.contact;
      }
    } else {
      modalContactLink.textContent = 'Non renseigné';
      modalContactLink.removeAttribute('href');
    }

    updateModalFavBtnState();
    detailModal.classList.add('open');
  }

  function closeModal() {
    detailModal.classList.remove('open');
    currentModalItem = null;
  }

  function updateModalFavBtnState() {
    if (!currentModalItem) return;
    const isFav = favorites.includes(currentModalItem.id);
    modalFavBtn.innerHTML = isFav 
      ? '<i class="fa-solid fa-heart" style="color: var(--accent-red);"></i> Retirer des favoris' 
      : '<i class="fa-regular fa-heart"></i> Ajouter aux favoris';
  }

  // Favorites Storage
  function toggleFavorite(id) {
    const idx = favorites.indexOf(id);
    if (idx > -1) {
      favorites.splice(idx, 1);
    } else {
      favorites.push(id);
    }
    localStorage.setItem('libertaire_favs', JSON.stringify(favorites));
    updateFavCount();
  }

  function updateFavCount() {
    favCount.textContent = favorites.length;
  }

  // CSV Export
  function exportToCsv() {
    if (filteredData.length === 0) return;

    const headers = ['Organisation', 'Nom', 'Ville / Zone', 'Contact', 'Adresse', 'Type', 'Page PDF'];
    const rows = filteredData.map(item => [
      `"${item.organisation.replace(/"/g, '""')}"`,
      `"${item.nom.replace(/"/g, '""')}"`,
      `"${item.ville.replace(/"/g, '""')}"`,
      `"${item.contact.replace(/"/g, '""')}"`,
      `"${item.adresse.replace(/"/g, '""')}"`,
      `"${item.type.replace(/"/g, '""')}"`,
      `"${item.page}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `repertoire_libertaire_cnt_ait_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Helper Utils
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function formatContactLink(contact) {
    if (!contact || contact === '—') return '—';
    if (contact.includes('@')) {
      return `<a href="mailto:${escapeHtml(contact)}" style="color: var(--accent-red); text-decoration: none;">${escapeHtml(contact)}</a>`;
    }
    return `<a href="${contact.startsWith('http') ? escapeHtml(contact) : 'https://' + escapeHtml(contact)}" target="_blank" style="color: var(--accent-red); text-decoration: none;">${escapeHtml(contact)}</a>`;
  }
});
