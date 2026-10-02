/* Public (read-only) rendering: home, results, stages, teams. */
(function (global) {
  'use strict';

  var MEDALS = ['', '\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];
  var selectedTeamId = null;
  var selectedCategory = '';
  var CATEGORIES = ['Junior', 'Senior', 'Super Senior', 'Teachers', 'Sub Junior', 'Parish Group'];

  function el(id) { return document.getElementById(id); }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatTime(value) {
    if (!value) return '';
    var d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }

  function positionLabel(pos) {
    pos = Number(pos);
    return pos === 1 ? '1st' : pos === 2 ? '2nd' : pos === 3 ? '3rd' : '—';
  }

  function emptyState(message) {
    return '<p class="empty">' + esc(message) + '</p>';
  }

  function teamName(id) {
    if (Array.isArray(Store.data.stations) && Store.data.stations.length) {
      var station = Store.data.stations.find(function (s) {
        return (s.id || s.substation) === id;
      });
      if (station) return station.substation || station.name || 'Unknown unit';
    }
    var t = Store.byId(Store.data.teams, id);
    return t ? t.name : 'Unknown unit';
  }

  function teamColor(id) {
    if (Array.isArray(Store.data.stations) && Store.data.stations.length) {
      var station = Store.data.stations.find(function (s) {
        return (s.id || s.substation) === id;
      });
      if (station) return station.color || '#64748b';
    }
    var t = Store.byId(Store.data.teams, id);
    return t ? t.color : '#64748b';
  }

  function stageName(id) {
    var s = Store.byId(Store.data.stages, id);
    return s ? s.name : 'Stage not assigned';
  }

  function resultParish(result) {
    if (result && result.parish) return result.parish;
    if (result && result.teamId && Array.isArray(Store.data.stations)) {
      var match = Store.data.stations.find(function (station) {
        return (station.id || station.substation) === result.teamId;
      });
      if (match) return match.parish || '';
    }
    return '';
  }

  function resultUnit(result) {
    if (result && result.teamId) {
      var currentName = teamName(result.teamId);
      if (currentName !== 'Unknown unit') return currentName;
    }
    if (result && result.unit) return result.unit;
    return '';
  }

  function itemCategories(item) {
    if (item && Array.isArray(item.categories) && item.categories.length) return item.categories;
    if (item && item.type === 'Group') return ['Parish Group'];
    if (item && item.section && item.section !== 'All') return [item.section];
    return CATEGORIES.filter(function (category) { return category !== 'Parish Group'; });
  }

  function resultCategoryName(result, item) {
    var categories = itemCategories(item);
    var category = result.category || item && item.section || categories[0] || 'Uncategorized';
    return categories.indexOf(category) !== -1 ? category : categories[0] || category;
  }

  function itemTitle(item, fallback) {
    if (!item) return esc(fallback || '');
    return esc(item.name || fallback || '') + (item.nameMl ? '<small class="item-name-ml" lang="ml">' + esc(item.nameMl) + '</small>' : '');
  }

  function stageItemTitle(item) {
    if (!item) return '';
    return esc(item.name || '') + (item.nameMl ? ' / ' + esc(item.nameMl) : '');
  }

  /* ---------------- Header ---------------- */
  function renderHeader() {
    var s = Store.data.settings;
    el('eventName').textContent = s.eventName || 'Bible Kalolsavam';
    el('eventSubtitle').textContent = s.subtitle || 'Score Board';
    document.title = (s.eventName || 'Bible Kalolsavam') + ' — Score Board';
    var banner = el('liveBanner');
    if (s.liveMessage) {
      el('liveMessage').textContent = s.liveMessage;
      banner.hidden = false;
    } else {
      banner.hidden = true;
    }
    var btn = el('adminBtn');
    var authed = Store.isAuthed();
    btn.classList.toggle('is-authed', authed);
    el('adminBtnLabel').textContent = authed ? 'Admin' : 'Admin';
  }

  /* ---------------- Home ---------------- */
  function renderHome() {
    var list = Store.parishStandings();
    var top = list.slice(0, 3);
    var order = [top[1], top[0], top[2]];
    el('podium').innerHTML = top.length
      ? order.map(function (row) {
          if (!row) return '<div class="podium-item" data-place="0"></div>';
          var unitBoxes = row.units.map(function (unit) {
            return '<div class="parish-unit-box"><span>' + esc(unit.unit) + '</span><strong>' + unit.points + '</strong></div>';
          }).join('');
          return '<div class="podium-item parish-card" data-place="' + row.rank + '">' +
            '<div class="rank">' + (MEDALS[row.rank] || row.rank) + '</div>' +
            '<div class="name">' + esc(row.parish) + '</div>' +
            '<div class="pts">' + row.total + ' pts</div>' +
            '<div class="parish-score-boxes">' + unitBoxes + '</div></div>';
        }).join('')
      : '';

    var recentResults = Store.data.results.slice().sort(function (a, b) {
      return (b.at || 0) - (a.at || 0);
    });
    var recentGroups = [];
    recentResults.forEach(function (result) {
      var item = Store.byId(Store.data.items, result.itemId);
      var category = resultCategoryName(result, item);
      var exists = recentGroups.some(function (group) {
        return group.itemId === result.itemId && group.category === category;
      });
      if (!exists && recentGroups.length < 5) recentGroups.push({ itemId: result.itemId, category: category });
    });

    el('latestResults').innerHTML = recentGroups.length
      ? recentGroups.map(function (group) {
          var item = Store.byId(Store.data.items, group.itemId);
          var itemResults = recentResults.filter(function (result) {
            var resultItem = Store.byId(Store.data.items, result.itemId);
            var category = result.category || resultItem && resultItem.section || 'Uncategorized';
            return result.itemId === group.itemId && category === group.category;
          })
            .sort(function (a, b) { return (a.position || 99) - (b.position || 99); });
          return '<div class="card">' +
            '<div class="card-title">' + itemTitle(item, 'Item removed') + '</div>' +
            '<div class="card-sub">' + (item ? esc(item.type) + ' &middot; ' : '') + esc(group.category) + '</div>' +
            '<div class="latest-item-results">' + itemResults.map(function (result) {
              var parish = resultParish(result);
              var unit = resultUnit(result);
              return '<div class="latest-item-row">' +
                '<span class="badge badge-' + (result.position || 0) + '">' + positionLabel(result.position) + '</span>' +
                '<span class="latest-item-who">' + esc(result.participant || unit) +
                  '<small>' + esc(parish || unit || teamName(result.teamId)) + (parish && unit ? ' &middot; ' + esc(unit) : '') +
                    (result.grade ? ' &middot; Grade ' + esc(result.grade) : '') + '</small></span>' +
                '<strong>' + Store.pointsFor(result) + ' pts</strong>' +
              '</div>';
            }).join('') + '</div></div>';
        }).join('')
      : emptyState('Results will appear here once published.');

    el('homeStages').innerHTML = Store.data.stages.length
      ? Store.data.stages.map(function (stage) {
          var live = Store.data.items.filter(function (i) {
            return i.stageId === stage.id && i.status === 'Ongoing';
          });
          var next = Store.data.items.filter(function (i) {
            return i.stageId === stage.id && i.status === 'Upcoming';
          });
          var forcedNow = next.length && (stage.name === 'Stage 2' || stage.name === 'Stage 3');
          var configuredItem = Store.byId(Store.data.items, stage.competitionItemId);
          var currentItem = configuredItem || (live.length ? live[0] : (forcedNow ? next[0] : null));
          var currentCategory = configuredItem && stage.competitionCategory ||
            (currentItem ? itemCategories(currentItem).join(' / ') || currentItem.section || 'General' : '');
          var configuredUpNextItem = Store.byId(Store.data.items, stage.upNextItemId);
          var scheduledUpNextItem = currentItem ? next.filter(function (item) {
            return item.id !== currentItem.id;
          })[0] : null;
          var upNextItem = configuredUpNextItem && (!currentItem || configuredUpNextItem.id !== currentItem.id)
            ? configuredUpNextItem : scheduledUpNextItem;
          var upNextCategory = configuredUpNextItem === upNextItem && stage.upNextCategory ||
            (upNextItem ? itemCategories(upNextItem).join(' / ') || upNextItem.section || 'General' : '');
          var isLive = configuredItem ? configuredItem.status === 'Ongoing' : live.length > 0;
          var itemDetails = currentItem
            ? '<span class="stage-now">NOW</span><span class="stage-current-item">' + stageItemTitle(currentItem) +
              ' &middot; ' + esc(currentCategory) + '</span>'
            : upNextItem ? '' : next.length
              ? 'Next: ' + stageItemTitle(next[0]) + ' &middot; ' +
                esc(itemCategories(next[0]).join(' / ') || next[0].section || 'General')
              : 'No scheduled items';
          return '<div class="card">' +
            '<div class="card-head">' +
              '<div style="flex:1;min-width:0">' +
                '<div class="card-title">' + esc(stage.name) + '</div>' +
                '<div class="card-sub">' + esc(stage.location || 'Location to be announced') +
                  (stage.incharge ? ' &middot; In charge: ' + esc(stage.incharge) : '') +
                  (stage.priestInCharge ? ' &middot; Priest-in-charge: ' + esc(stage.priestInCharge) : '') + '</div>' +
              '</div>' +
              (isLive ? '<span class="badge badge-ongoing">LIVE</span>' : '') +
            '</div>' +
            (itemDetails ? '<div class="' + (currentItem ? 'stage-current' : 'card-sub') + '" style="margin-top:8px">' +
              itemDetails + '</div>' : '') +
            (upNextItem ? '<div class="card-sub" style="margin-top:6px"><strong>UP NEXT</strong> ' +
              stageItemTitle(upNextItem) + ' &middot; ' + esc(upNextCategory) + '</div>' : '') +
            '</div>';
        }).join('')
      : emptyState('No stages configured.');
  }

  /* ---------------- Results ---------------- */
  function renderCategoryTabs() {
    el('resultCategories').innerHTML = '<button class="category-tab' + (!selectedCategory ? ' is-active' : '') +
      '" type="button" data-category="">All categories</button>' + CATEGORIES.map(function (category) {
        return '<button class="category-tab' + (selectedCategory === category ? ' is-active' : '') +
          '" type="button" data-category="' + esc(category) + '">' + esc(category) + '</button>';
      }).join('');
  }

  function renderResults() {
    renderCategoryTabs();
    var query = (el('resultSearch').value || '').toLowerCase().trim();
    var grouped = Store.resultsByItem();

    var items = Store.data.items.map(function (item) {
      var rows = (grouped[item.id] || []).filter(function (result) {
        return !selectedCategory || resultCategoryName(result, item) === selectedCategory;
      });
      return { item: item, rows: rows };
    }).filter(function (entry) {
      if (!entry.rows.length) return false;
      if (!query) return true;
      if ((entry.item.name || '').toLowerCase().indexOf(query) !== -1 ||
          (entry.item.nameMl || '').toLowerCase().indexOf(query) !== -1) return true;
      return entry.rows.some(function (r) {
        var parish = resultParish(r).toLowerCase();
        var unit = resultUnit(r).toLowerCase();
        return (r.participant || '').toLowerCase().indexOf(query) !== -1 ||
          parish.indexOf(query) !== -1 ||
          unit.indexOf(query) !== -1 ||
          teamName(r.teamId).toLowerCase().indexOf(query) !== -1;
      });
    });

    el('itemResults').innerHTML = items.length
      ? items.map(function (entry) {
          var item = entry.item;
          var rows = entry.rows;
          return '<div class="card">' +
            '<div class="card-head">' +
              '<div style="flex:1;min-width:0">' +
                '<div class="card-title">' + itemTitle(item) + '</div>' +
                '<div class="card-sub">' + esc(item.type) + ' &middot; ' +
                  esc(selectedCategory || itemCategories(item).join(' / ') || item.section || 'General') +
                  ' &middot; ' + esc(stageName(item.stageId)) + '</div>' +
              '</div>' +
              '<span class="badge badge-' + esc((item.status || '').toLowerCase()) + '">' +
                esc(item.status || 'Upcoming') + '</span>' +
            '</div>' +
            '<div style="margin-top:8px">' +
              (rows.length ? rows.map(function (r) {
                var parish = resultParish(r);
                var unit = resultUnit(r);
                return '<div class="result-row">' +
                  '<span class="badge badge-' + (r.position || 0) + '">' + positionLabel(r.position) + '</span>' +
                  '<span class="who"><b>' + esc(r.participant || unit) + '</b>' +
                    '<small>' + esc(parish || unit || teamName(r.teamId)) + (parish && unit ? ' &middot; ' + esc(unit) : '') +
                    (r.grade ? ' &middot; Grade ' + esc(r.grade) : '') + '</small></span>' +
                  '<span class="pts">' + Store.pointsFor(r) + '</span>' +
                '</div>';
              }).join('') : '<div class="card-sub">Result not declared yet.</div>') +
            '</div></div>';
        }).join('')
      : emptyState('No items match your search.');
  }

  function selectCategory(category) {
    selectedCategory = CATEGORIES.indexOf(category) !== -1 ? category : '';
    renderResults();
  }

  /* ---------------- Stages ---------------- */
  function renderStages() {
    el('stageList').innerHTML = Store.data.stages.length
      ? Store.data.stages.map(function (stage) {
          var items = Store.data.items.filter(function (i) { return i.stageId === stage.id; });
          return '<div class="card">' +
            '<div class="card-head">' +
              '<div style="flex:1;min-width:0">' +
                '<div class="card-title stage-name">' + esc(stage.name) + '</div>' +
                '<div class="card-sub">' + esc(stage.location || 'Location to be announced') +
                  (stage.incharge ? ' &middot; In charge: ' + esc(stage.incharge) : '') +
                  (stage.priestInCharge ? ' &middot; Priest-in-charge: ' + esc(stage.priestInCharge) : '') + '</div>' +
              '</div>' +
              '<span class="badge">' + items.length + ' items</span>' +
            '</div>' +
            '<div style="margin-top:8px">' +
              (items.length ? items.map(function (i) {
                return '<div class="result-row' + (i.status === 'Ongoing' ? ' stage-item-current' : '') + '">' +
                  '<span class="who"><b>' + stageItemTitle(i) + ' : ' +
                    esc(itemCategories(i).join(' / ') || i.section || 'General') + '</b><small>' +
                    esc(i.type) +
                    (i.time ? ' &middot; ' + esc(formatTime(i.time)) : '') + '</small></span>' +
                  '<span class="badge badge-' + esc((i.status || '').toLowerCase()) + '">' +
                    esc(i.status || 'Upcoming') + '</span>' +
                '</div>';
              }).join('') : '<div class="card-sub">No items scheduled.</div>') +
            '</div></div>';
        }).join('')
      : emptyState('No stages configured.');
  }

  /* ---------------- Parish & Sub-stations ---------------- */
  function renderStations() {
    var stations = Array.isArray(Store.data.stations) ? Store.data.stations : [];
    var grouped = {};

    stations.forEach(function (station) {
      var parish = station.parish || 'Unknown Parish';
      (grouped[parish] = grouped[parish] || { parish: parish, rows: [] }).rows.push(station);
    });

    var parishList = Object.keys(grouped).map(function (parish) {
      var rows = grouped[parish].rows.slice().sort(function (a, b) { return (Number(a.no) || 0) - (Number(b.no) || 0); });
      var total = rows.reduce(function (sum, row) { return sum + (Number(row.score) || 0); }, 0);
      return '<div class="card">' +
        '<div class="card-head">' +
          '<div style="flex:1;min-width:0">' +
            '<div class="card-title station-parish">' + esc(parish) + '</div>' +
            '<div class="card-sub">Total score: ' + total + '</div>' +
          '</div>' +
          '<span class="badge">' + rows.length + ' units</span>' +
        '</div>' +
        '<div style="margin-top:8px">' + rows.map(function (row) {
          return '<div class="result-row">' +
            '<span class="station-number">' + esc(row.no || '') + '</span>' +
            '<span class="who"><b class="station-substation">' + esc(row.substation || 'Sub-station') + '</b></span>' +
            '<strong class="team-result-points">' + (Number(row.score) || 0) + ' pts</strong>' +
          '</div>';
        }).join('') + '</div></div>';
    });

    el('stationList').innerHTML = parishList.length ? parishList.join('') : emptyState('Parish and sub-station scores will appear here.');
  }

  /* ---------------- Teams ---------------- */
  function renderTeams() {
    var list = Store.standings();
    var selected = selectedTeamId ? Store.byId(Store.data.teams, selectedTeamId) : null;
    if (selected) {
      var row = list.filter(function (entry) { return entry.team.id === selected.id; })[0];
      var results = Store.data.results.filter(function (result) { return result.teamId === selected.id; })
        .sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
      el('teamList').hidden = true;
      el('teamDetail').hidden = false;
      el('teamDetail').innerHTML = '<div class="team-detail-head">' +
          '<span class="team-detail-swatch" style="background:' + esc(selected.color) + '"></span>' +
          '<div><h3>' + esc(selected.name) + '</h3><p class="card-sub">' + esc(selected.short || '') + '</p></div>' +
          '<strong class="team-detail-points">' + (row ? row.points : 0) + ' pts</strong>' +
        '</div>' +
        '<div class="team-stats">' +
          '<div><strong>' + (row ? row.entries : 0) + '</strong><span>Results</span></div>' +
          '<div><strong>' + (row ? row.first : 0) + '</strong><span>First</span></div>' +
          '<div><strong>' + (row ? row.second : 0) + '</strong><span>Second</span></div>' +
          '<div><strong>' + (row ? row.third : 0) + '</strong><span>Third</span></div>' +
        '</div>' +
        '<h3 class="section-title team-results-title">Unit results</h3>' +
        (results.length ? '<div class="card-list">' + results.map(function (result) {
          var item = Store.byId(Store.data.items, result.itemId);
          return '<div class="card team-result-row"><div>' + itemTitle(item, 'Item removed') +
            '<div class="card-sub">' + esc(result.participant || selected.name) +
            (result.grade ? ' &middot; Grade ' + esc(result.grade) : '') + '</div></div>' +
            '<div><span class="badge badge-' + (result.position || 0) + '">' + positionLabel(result.position) + '</span>' +
            '<strong class="team-result-points">' + Store.pointsFor(result) + ' pts</strong></div></div>';
        }).join('') + '</div>' : emptyState('No results declared for this unit.'));
      return;
    }
    el('teamDetail').hidden = true;
    el('teamList').hidden = false;
    el('teamList').innerHTML = list.length
      ? '<div class="team-grid">' + list.map(function (row) {
          return '<button class="team-box" type="button" data-team-id="' + esc(row.team.id) + '">' +
            '<span class="team-box-swatch" style="background:' + esc(row.team.color) + '"></span>' +
            '<span class="team-box-name">' + esc(row.team.name) + '</span>' +
            '<span class="team-box-meta">' + esc(row.team.short || '') + ' &middot; ' + row.points + ' pts</span>' +
            '<span class="team-box-arrow" aria-hidden="true">&#8250;</span></button>';
        }).join('') + '</div>'
      : emptyState('No teams added yet.');
  }

  function selectTeam(id) {
    selectedTeamId = id;
    renderTeams();
  }

  function clearTeam() {
    selectedTeamId = null;
    renderTeams();
  }

  function renderScoreboard() {
    function categoryHeaderClass(category) {
      var classes = {
        'Junior': 'scoreboard-category-junior',
        'Senior': 'scoreboard-category-senior',
        'Super Senior': 'scoreboard-category-super-senior',
        'Teachers': 'scoreboard-category-teachers',
        'Sub Junior': 'scoreboard-category-sub-junior',
        'Parish Group': 'scoreboard-category-parish-group'
      };
      return classes[category] || '';
    }

    var itemOrder = {};
    Store.data.items.forEach(function (item, index) { itemOrder[item.id] = index; });
    var columnMap = {};
    function addColumn(itemId, category) {
      var item = Store.byId(Store.data.items, itemId);
      var groupId = item ? item.baseItemId || item.id : itemId;
      var key = JSON.stringify([groupId, category]);
      if (!columnMap[key]) {
        columnMap[key] = {
          key: JSON.stringify([itemId, category]),
          itemId: itemId,
          groupId: groupId,
          itemName: item ? (item.code ? item.code + ' · ' : '') + item.name : 'Removed item',
          category: category
        };
      }
    }
    Store.data.items.forEach(function (item) {
      itemCategories(item).forEach(function (category) { addColumn(item.id, category); });
    });
    Store.data.results.forEach(function (result) {
      var item = Store.byId(Store.data.items, result.itemId);
      addColumn(result.itemId, resultCategoryName(result, item));
    });
    var columns = Object.keys(columnMap).map(function (key) { return columnMap[key]; });
    columns.sort(function (a, b) {
      var aOrder = itemOrder[a.groupId] === undefined ? Store.data.items.length : itemOrder[a.groupId];
      var bOrder = itemOrder[b.groupId] === undefined ? Store.data.items.length : itemOrder[b.groupId];
      if (aOrder !== bOrder) return aOrder - bOrder;
      var aCategory = CATEGORIES.indexOf(a.category);
      var bCategory = CATEGORIES.indexOf(b.category);
      if (aCategory === -1) aCategory = CATEGORIES.length;
      if (bCategory === -1) bCategory = CATEGORIES.length;
      return aCategory - bCategory || a.category.localeCompare(b.category);
    });

    var groups = [];
    columns.forEach(function (column) {
      var group = groups[groups.length - 1];
      if (!group || group.groupId !== column.groupId) {
        group = { groupId: column.groupId, name: column.itemName, columns: [] };
        groups.push(group);
      }
      group.columns.push(column);
    });
    groups.forEach(function (group) {
      group.columns[group.columns.length - 1].isItemEnd = true;
    });

    var rows = [];
    var rowMap = {};
    function ensureRow(key, parish, unit, unitOrder) {
      if (!rowMap[key]) {
        rowMap[key] = { parish: parish, unit: unit, unitOrder: Number(unitOrder) || Number.MAX_VALUE, scores: {}, total: 0 };
        rows.push(rowMap[key]);
      }
      return rowMap[key];
    }

    (Array.isArray(Store.data.stations) ? Store.data.stations : []).forEach(function (station) {
      var parish = (station.parish || '').trim();
      var unit = (station.substation || station.name || '').trim();
      if (!parish || !unit) return;
      ensureRow('station:' + (station.id || unit), parish, unit, station.no);
    });

    Store.data.results.forEach(function (result) {
      var station = Array.isArray(Store.data.stations) ? Store.data.stations.find(function (entry) {
        return (entry.id || entry.substation) === result.teamId;
      }) : null;
      var parish = result.parish || station && station.parish || '';
      var unit = result.unit || station && (station.substation || station.name) || '';
      if (!parish || !unit) return;
      var rowKey = station
        ? 'station:' + (station.id || unit)
        : 'result:' + JSON.stringify([parish, unit]);
      var row = ensureRow(rowKey, parish, unit, station && station.no);
      var item = Store.byId(Store.data.items, result.itemId);
      var category = resultCategoryName(result, item);
      var columnKey = JSON.stringify([result.itemId, category]);
      var points = Store.pointsFor(result);
      row.scores[columnKey] = (row.scores[columnKey] || 0) + points;
      row.total += points;
    });

    var parishTotals = {};
    rows.forEach(function (row) {
      parishTotals[row.parish] = (parishTotals[row.parish] || 0) + row.total;
    });
    rows.sort(function (a, b) {
      return parishTotals[b.parish] - parishTotals[a.parish] ||
        a.parish.localeCompare(b.parish) || a.unitOrder - b.unitOrder || a.unit.localeCompare(b.unit);
    });
    var parishCounts = {};
    rows.forEach(function (row) {
      parishCounts[row.parish] = (parishCounts[row.parish] || 0) + 1;
    });
    var renderedParishes = {};

    var table = rows.length
      ? '<div class="scoreboard-scroll" role="region" aria-label="Parish and unit score table" tabindex="0">' +
        '<table class="scoreboard-table" aria-label="Score by parish, unit, competition and category">' +
          '<thead><tr><th class="scoreboard-parish" scope="col" rowspan="2">Parish</th>' +
            '<th class="scoreboard-unit" scope="col" rowspan="2">Unit</th>' +
            groups.map(function (group) {
              return '<th class="scoreboard-item-group scoreboard-item-end" scope="colgroup" colspan="' + group.columns.length + '">' + esc(group.name) + '</th>';
            }).join('') +
            '<th class="scoreboard-unit-total" scope="col" rowspan="2">Unit Total</th>' +
            '<th class="scoreboard-total" scope="col" rowspan="2">Total</th>' +
          '</tr><tr>' + columns.map(function (column) {
              return '<th class="scoreboard-category ' + categoryHeaderClass(column.category) +
                (column.isItemEnd ? ' scoreboard-item-end' : '') + '" scope="col">' +
                esc(column.category) + '</th>';
          }).join('') + '</tr></thead><tbody>' +
          rows.map(function (row) {
            var parishCell = '';
            var parishTotalCell = '';
            var parishStart = !renderedParishes[row.parish];
            if (parishStart) {
              renderedParishes[row.parish] = true;
              parishCell = '<th class="scoreboard-parish" scope="rowgroup" rowspan="' + parishCounts[row.parish] + '">' + esc(row.parish) + '</th>';
              parishTotalCell = '<td class="scoreboard-total" rowspan="' + parishCounts[row.parish] + '">' +
                parishTotals[row.parish] + '</td>';
            }
            return '<tr' + (parishStart ? ' class="scoreboard-parish-start"' : '') + '>' + parishCell +
              '<td class="scoreboard-unit">' + esc(row.unit) + '</td>' +
              columns.map(function (column) {
                return '<td class="scoreboard-score' + (column.isItemEnd ? ' scoreboard-item-end' : '') + '">' +
                  (row.scores[column.key] || 0) + '</td>';
              }).join('') +
              '<td class="scoreboard-unit-total">' + row.total + '</td>' +
              parishTotalCell + '</tr>';
          }).join('') +
        '</tbody></table></div>'
      : emptyState('Parish and unit scores will appear here once configured.');
    el('scoreboardTable').innerHTML = table;
  }

  function scoreboardExportData() {
    var table = el('scoreboardTable').querySelector('.scoreboard-table');
    if (!table) return null;
    var categoryHeaders = Array.prototype.slice.call(table.querySelectorAll('thead tr:nth-child(2) .scoreboard-category'));
    var columns = [
      { header: 'Parish', dataKey: 'parish' },
      { header: 'Unit', dataKey: 'unit' }
    ];
    var categoryIndex = 0;
    Array.prototype.forEach.call(table.querySelectorAll('thead tr:first-child .scoreboard-item-group'), function (group) {
      for (var i = 0; i < group.colSpan; i++) {
        var category = categoryHeaders[categoryIndex++];
        columns.push({
          header: group.textContent.trim() + ' - ' + (category ? category.textContent.trim() : 'Category'),
          dataKey: 'score' + categoryIndex
        });
      }
    });
    columns.push(
      { header: 'Unit Total', dataKey: 'unitTotal' },
      { header: 'Parish Total', dataKey: 'parishTotal' }
    );

    var rows = [];
    var currentParish = '';
    Array.prototype.forEach.call(table.querySelectorAll('tbody tr'), function (row) {
      var parish = row.querySelector('.scoreboard-parish');
      if (parish) currentParish = parish.textContent.trim();
      var values = {
        parish: currentParish,
        unit: row.querySelector('.scoreboard-unit').textContent.trim(),
        unitTotal: row.querySelector('.scoreboard-unit-total').textContent.trim(),
        parishTotal: ''
      };
      Array.prototype.forEach.call(row.querySelectorAll('.scoreboard-score'), function (cell, index) {
        values['score' + (index + 1)] = cell.textContent.trim();
      });
      var parishTotal = row.querySelector('.scoreboard-total');
      if (parishTotal) values.parishTotal = parishTotal.textContent.trim();
      rows.push(values);
    });
    return { columns: columns, rows: rows };
  }

  function downloadScoreboard() {
    var report = scoreboardExportData();
    if (!report) return;
    function csvValue(value) {
      return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
    }
    var lines = [report.columns.map(function (column) { return column.header; })];
    report.rows.forEach(function (row) {
      lines.push(report.columns.map(function (column) { return row[column.dataKey] || ''; }));
    });

    var content = '\uFEFF' + lines.map(function (line) {
      return line.map(csvValue).join(',');
    }).join('\r\n');
    var url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    var link = document.createElement('a');
    link.href = url;
    link.download = 'kalolsavam-scoreboard.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    global.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function renderAll() {
    renderHeader();
    renderHome();
    renderScoreboard();
    renderResults();
    renderStages();
    renderStations();
    renderTeams();
  }

  global.UI = {
    el: el,
    esc: esc,
    formatTime: formatTime,
    positionLabel: positionLabel,
    emptyState: emptyState,
    itemTitle: itemTitle,
    teamName: teamName,
    stageName: stageName,
    renderAll: renderAll,
    renderResults: renderResults,
    renderStations: renderStations,
    downloadScoreboard: downloadScoreboard,
    selectCategory: selectCategory
    ,selectTeam: selectTeam
    ,clearTeam: clearTeam
  };
})(window);
