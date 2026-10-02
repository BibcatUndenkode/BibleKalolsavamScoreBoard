/* Admin area: login gate and CRUD for results, items, stages, teams and settings. */
(function (global) {
  'use strict';

  var el = UI.el, esc = UI.esc;
  var DEFAULT_CATEGORIES = ['Junior', 'Senior', 'Super Senior', 'Teachers', 'Sub Junior'];
  var ITEM_CATEGORY_OPTIONS = DEFAULT_CATEGORIES.concat(['Parish Group']);

  function toast(message) {
    var node = el('toast');
    node.textContent = message;
    node.hidden = false;
    clearTimeout(node._timer);
    node._timer = setTimeout(function () { node.hidden = true; }, 2200);
  }

  function refresh() {
    UI.renderAll();
    if (Store.isAuthed()) renderAdmin();
  }

  /* ---------------- gate ---------------- */
  function syncGate() {
    var authed = Store.isAuthed();
    el('adminLocked').hidden = authed;
    el('adminPanel').hidden = !authed;
    if (authed) renderAdmin();
  }

  function bindLogin() {
    el('loginForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var error = el('loginError');
      error.hidden = true;
      Store.login(el('loginUser').value.trim(), el('loginPass').value).then(function (ok) {
        if (!ok) {
          error.textContent = 'Incorrect username or password.';
          error.hidden = false;
          return;
        }
        el('loginPass').value = '';
        syncGate();
        UI.renderAll();
        toast('Signed in as admin');
      });
    });

    el('logoutBtn').addEventListener('click', function () {
      Store.logout();
      syncGate();
      UI.renderAll();
      toast('Signed out');
      global.App.go('home');
    });
  }

  /* ---------------- admin tabs ---------------- */
  function bindTabs() {
    el('adminTabs').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-tab]');
      if (!btn) return;
      var tab = btn.dataset.tab;
      Array.prototype.forEach.call(el('adminTabs').children, function (c) {
        c.classList.toggle('is-active', c.dataset.tab === tab);
      });
      document.querySelectorAll('.admin-tab').forEach(function (panel) {
        panel.hidden = panel.dataset.tab !== tab;
      });
    });
  }

  /* ---------------- option helpers ---------------- */
  function fillSelect(select, records, placeholder) {
    var current = select.value;
    select.innerHTML = (placeholder ? '<option value="">' + esc(placeholder) + '</option>' : '') +
      records.map(function (r) {
        return '<option value="' + esc(r.id) + '">' + esc(r.name) + '</option>';
      }).join('');
    if (current) select.value = current;
  }

  function itemCategories(item) {
    if (item && Array.isArray(item.categories) && item.categories.length) return item.categories;
    if (item && item.type === 'Group') return ['Parish Group'];
    if (item && item.section && item.section !== 'All') return [item.section];
    return DEFAULT_CATEGORIES;
  }

  function itemOptionRecords() {
    return Store.data.items.map(function (item) {
      var category = itemCategories(item)[0] || item.section || 'General';
      return { id: item.id, name: (item.name || 'Untitled item') + ' - ' + category };
    });
  }

  function adminItemTitle(item) {
    var category = itemCategories(item)[0] || item.section || 'General';
    return esc(item && item.name || '') + (item && item.nameMl ? ' / ' + esc(item.nameMl) : '') +
      ' : ' + esc(category);
  }

  function syncResultCategoryOptions() {
    var item = Store.byId(Store.data.items, el('resultItem').value);
    var current = el('resultCategory').value;
    var categories = itemCategories(item);
    fillSelect(el('resultCategory'), categories.map(function (category) {
      return { id: category, name: category };
    }), 'Select category');
    if (current && categories.indexOf(current) !== -1) el('resultCategory').value = current;
    else if (categories.length === 1) el('resultCategory').value = categories[0];
  }

  function syncStageCategoryOptions(itemSelectId, categorySelectId) {
    var item = Store.byId(Store.data.items, el(itemSelectId).value);
    var current = el(categorySelectId).value;
    var categories = item ? itemCategories(item) : [];
    fillSelect(el(categorySelectId), categories.map(function (category) {
      return { id: category, name: category };
    }), 'Select category');
    el(categorySelectId).disabled = !item;
    if (current && categories.indexOf(current) !== -1) el(categorySelectId).value = current;
    else if (categories.length) el(categorySelectId).value = categories[0];
  }

  function parishOptions() {
    var sources = Array.isArray(Store.data.stations) && Store.data.stations.length ? Store.data.stations : Store.data.teams;
    var list = [];
    var seen = {};
    sources.forEach(function (entry) {
      var parish = (entry.parish || entry.name || '').trim();
      if (!parish || seen[parish]) return;
      seen[parish] = true;
      list.push({ id: parish, name: parish });
    });
    return list;
  }

  function unitOptions(parish, item) {
    if (item && item.type === 'Group') return [{ id: 'parish-group', name: 'Parish Group' }];
    var units = Store.data.teams.map(function (team) { return { id: team.id, name: team.name }; });
    if (!Array.isArray(Store.data.stations) || !Store.data.stations.length) return units;
    if (!parish) return units;
    var parishUnits = Store.data.stations.filter(function (station) {
      return (station.parish || '').trim() === parish;
    }).map(function (station) {
      return { id: station.id || station.substation, name: station.substation || station.name || station.parish };
    });
    if (!parishUnits.length) return [];
    return parishUnits;
  }

  function syncUnitOptions() {
    var parish = el('resultParish').value;
    var current = el('resultUnit').value;
    var item = Store.byId(Store.data.items, el('resultItem').value);
    var units = unitOptions(parish, item);
    fillSelect(el('resultUnit'), units, 'Select unit');
    if (current && units.some(function (unit) { return unit.id === current; })) {
      el('resultUnit').value = current;
    } else if (item && item.type === 'Group' && units.length === 1) {
      el('resultUnit').value = units[0].id;
    }
  }

  function rowActions(id, kind) {
    return '<div class="row-actions">' +
      '<button class="btn btn-sm" type="button" data-edit="' + kind + '" data-id="' + esc(id) + '">Edit</button>' +
      '<button class="btn btn-sm btn-danger" type="button" data-del="' + kind + '" data-id="' + esc(id) + '">Delete</button>' +
      '</div>';
  }

  function completedItemsForStage(stageId) {
    return Store.data.items.filter(function (item) {
      return item.stageId === stageId && item.status === 'Completed';
    }).sort(function (a, b) {
      var aCompletedAt = Number(a.completedAt) || 0;
      var bCompletedAt = Number(b.completedAt) || 0;
      if (aCompletedAt && bCompletedAt && aCompletedAt !== bCompletedAt) return aCompletedAt - bCompletedAt;
      if (aCompletedAt && !bCompletedAt) return -1;
      if (bCompletedAt && !aCompletedAt) return 1;
      var aTime = (a.time || '').trim();
      var bTime = (b.time || '').trim();
      if (aTime && bTime && aTime !== bTime) return aTime.localeCompare(bTime);
      if (aTime && !bTime) return -1;
      if (bTime && !aTime) return 1;
      return (a.code || '').localeCompare(b.code || '', undefined, { numeric: true }) ||
        (a.name || '').localeCompare(b.name || '');
    });
  }

  function stageCompletionRows() {
    var rows = [];
    Store.data.stages.forEach(function (stage) {
      completedItemsForStage(stage.id).forEach(function (item, index) {
        itemCategories(item).forEach(function (category) {
          rows.push({ stageId: stage.id, stage: stage.name, sequence: index + 1, item: item, category: category });
        });
      });
    });
    return rows;
  }

  /* ---------------- render admin lists ---------------- */
  function renderAdmin() {
    fillSelect(el('resultItem'), itemOptionRecords(), 'Select item');
    syncResultCategoryOptions();
    fillSelect(el('resultParish'), parishOptions(), 'Select parish');
    syncUnitOptions();
    fillSelect(el('itemStage'), Store.data.stages, 'Unassigned');
    fillSelect(el('itemCategory'), ITEM_CATEGORY_OPTIONS.map(function (category) {
      return { id: category, name: category };
    }), 'Select category');
    fillSelect(el('stageCompetitionItem'), itemOptionRecords(), 'Select item');
    fillSelect(el('stageUpNextItem'), itemOptionRecords(), 'Select item');
    syncStageCategoryOptions('stageCompetitionItem', 'stageCompetitionCategory');
    syncStageCategoryOptions('stageUpNextItem', 'stageUpNextCategory');

    var results = Store.data.results.slice().sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
    el('adminResultList').innerHTML = results.length
      ? results.map(function (r) {
          var item = Store.byId(Store.data.items, r.itemId);
          var parish = r.parish || (r.teamId ? (Store.data.stations && Store.data.stations.some(function (station) { return (station.id || station.substation) === r.teamId; }) ? Store.data.stations.filter(function (station) { return (station.id || station.substation) === r.teamId; })[0].parish : '') : '');
          var unit = r.unit || (r.teamId ? (UI.teamName(r.teamId) || '') : '');
          return '<div class="card"><div class="card-head">' +
            '<div style="flex:1;min-width:0">' +
              '<div class="card-title">' + UI.itemTitle(item, 'Item removed') + '</div>' +
              '<div class="card-sub">' + esc(r.participant || unit) + ' &middot; ' +
                esc(parish || unit || UI.teamName(r.teamId)) + ' &middot; ' +
                esc(unit || UI.teamName(r.teamId)) + ' &middot; ' + esc(r.category || item && item.section || 'Uncategorized') +
                ' &middot; ' + UI.positionLabel(r.position) +
                (r.grade ? ' &middot; Grade ' + esc(r.grade) : '') +
                ' &middot; ' + Store.pointsFor(r) + ' pts</div>' +
            '</div>' + rowActions(r.id, 'result') + '</div></div>';
        }).join('')
      : UI.emptyState('No results recorded.');

    el('adminItemList').innerHTML = Store.data.items.length
      ? Store.data.items.map(function (i) {
          return '<div class="card"><div class="card-head">' +
            '<div style="flex:1;min-width:0">' +
              '<div class="card-title">' + adminItemTitle(i) + '</div>' +
              '<div class="card-sub">' + esc(i.type) +
                ' &middot; ' + esc(UI.stageName(i.stageId)) + ' &middot; ' + esc(i.status) +
                (i.time ? ' &middot; ' + esc(UI.formatTime(i.time)) : '') + '</div>' +
            '</div>' + rowActions(i.id, 'item') + '</div></div>';
        }).join('')
      : UI.emptyState('No items added.');

    el('adminStageList').innerHTML = Store.data.stages.length
      ? Store.data.stages.map(function (s) {
          return '<div class="card"><div class="card-head">' +
            '<div style="flex:1;min-width:0">' +
              '<div class="card-title">' + esc(s.name) + '</div>' +
              '<div class="card-sub">' + esc(s.location || '—') +
                (s.incharge ? ' &middot; In charge: ' + esc(s.incharge) : '') +
                (s.priestInCharge ? ' &middot; Priest-in-charge: ' + esc(s.priestInCharge) : '') + '</div>' +
            '</div>' + rowActions(s.id, 'stage') + '</div></div>';
        }).join('')
      : UI.emptyState('No stages added.');

    el('stageCompletionReport').innerHTML = Store.data.stages.length
      ? Store.data.stages.map(function (stage) {
          var items = completedItemsForStage(stage.id);
          return '<section class="stage-report-group"><h4>' + esc(stage.name) + '</h4>' +
            (items.length ? '<ol class="stage-report-list">' + items.map(function (item, index) {
              return itemCategories(item).map(function (category) {
                return '<li value="' + (index + 1) + '"><b>' + esc(item.name || '') +
                  (item.nameMl ? ' / ' + esc(item.nameMl) : '') + '</b>' +
                  '<small>' + esc(category) +
                  (item.completedAt ? ' &middot; Completed ' + esc(UI.formatTime(item.completedAt)) :
                    item.time ? ' &middot; Scheduled ' + esc(UI.formatTime(item.time)) : ' &middot; Completion time not recorded') +
                  '</small></li>';
              }).join('');
            }).join('') + '</ol>' : '<p class="empty">No completed items.</p>') +
            '</section>';
        }).join('')
      : UI.emptyState('No stages configured.');

    el('adminTeamList').innerHTML = Store.data.teams.length
      ? Store.data.teams.map(function (t) {
          return '<div class="card"><div class="card-head">' +
            '<span class="swatch" style="background:' + esc(t.color) + '"></span>' +
            '<div style="flex:1;min-width:0">' +
              '<div class="card-title">' + esc(t.name) + '</div>' +
              '<div class="card-sub">' + esc(t.short || '—') + '</div>' +
            '</div>' + rowActions(t.id, 'team') + '</div></div>';
        }).join('')
      : UI.emptyState('No teams added.');

    var s = Store.data.settings;
    el('setName').value = s.eventName || '';
    el('setSubtitle').value = s.subtitle || '';
    el('setVenue').value = s.venue || '';
    el('setDates').value = s.dates || '';
    el('setLive').value = s.liveMessage || '';
    el('singleFirst').value = s.points.singleFirst;
    el('singleSecond').value = s.points.singleSecond;
    el('singleThird').value = s.points.singleThird;
    el('groupFirst').value = s.points.groupFirst;
    el('groupSecond').value = s.points.groupSecond;
    el('groupThird').value = s.points.groupThird;
    el('singleGradeA').value = s.points.singleGradeA;
    el('singleGradeB').value = s.points.singleGradeB;
    el('singleGradeC').value = s.points.singleGradeC;
    el('singleGradeD').value = s.points.singleGradeD;
    el('singleGradeE').value = s.points.singleGradeE;
    el('groupGradeA').value = s.points.groupGradeA;
    el('groupGradeB').value = s.points.groupGradeB;
    el('groupGradeC').value = s.points.groupGradeC;
    el('groupGradeD').value = s.points.groupGradeD;
    el('groupGradeE').value = s.points.groupGradeE;
  }

  /* ---------------- forms ---------------- */
  function resetResultForm() {
    el('resultId').value = '';
    el('resultCategory').value = '';
    el('resultParish').value = '';
    el('resultUnit').value = '';
    el('resultParticipant').value = '';
    el('resultPosition').value = '1';
    el('resultGrade').value = 'A';
    syncResultCategoryOptions();
    syncUnitOptions();
  }

  function bindForms() {
    el('resultItem').addEventListener('change', function () {
      syncResultCategoryOptions();
      syncUnitOptions();
    });
    el('stageCompetitionItem').addEventListener('change', function () {
      syncStageCategoryOptions('stageCompetitionItem', 'stageCompetitionCategory');
    });
    el('stageUpNextItem').addEventListener('change', function () {
      syncStageCategoryOptions('stageUpNextItem', 'stageUpNextCategory');
    });
    el('resultParish').addEventListener('change', syncUnitOptions);

    el('resultForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var item = Store.byId(Store.data.items, el('resultItem').value);
      if (!item || itemCategories(item).indexOf(el('resultCategory').value) === -1 || !el('resultParish').value || !el('resultUnit').value) {
        toast('Choose an item, category, parish and unit');
        return;
      }
      var unitId = el('resultUnit').value;
      var parish = el('resultParish').value;
      var category = el('resultCategory').value;
      var resultId = el('resultId').value;
      if (item.type === 'Group') {
        var existingGroupResult = Store.data.results.find(function (result) {
          return result.id !== resultId && result.itemId === item.id && result.parish === parish &&
            (result.category || item.section) === category;
        });
        if (existingGroupResult) resultId = existingGroupResult.id;
      }
      Store.upsert(Store.data.results, {
        id: resultId || '',
        itemId: el('resultItem').value,
        category: category,
        parish: parish,
        unit: el('resultUnit').selectedOptions && el('resultUnit').selectedOptions[0] ? el('resultUnit').selectedOptions[0].text : el('resultUnit').value,
        teamId: item.type === 'Group' ? 'parish-group:' + parish : unitId,
        participant: el('resultParticipant').value.trim(),
        position: parseInt(el('resultPosition').value, 10) || 0,
        grade: el('resultGrade').value,
        at: Date.now()
      });
      resetResultForm();
      el('resultEditor').open = false;
      refresh();
      toast('Result saved');
    });
    el('resultReset').addEventListener('click', resetResultForm);

    el('itemForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var category = el('itemCategory').value;
      var itemId = el('itemId').value;
      var previousItem = itemId ? Store.byId(Store.data.items, itemId) : null;
      var status = el('itemStatus').value;
      Store.upsert(Store.data.items, {
        id: itemId || '',
        name: el('itemName').value.trim(),
        nameMl: el('itemNameMl').value.trim(),
        type: el('itemType').value,
        section: category,
        categories: [category],
        stageId: el('itemStage').value,
        status: status,
        completedAt: status === 'Completed'
          ? previousItem ? previousItem.completedAt || '' : Date.now()
          : '',
        time: el('itemTime').value
      });
      el('itemForm').reset();
      el('itemId').value = '';
      el('itemEditor').open = false;
      refresh();
      toast('Item saved');
    });
    el('itemReset').addEventListener('click', function () {
      el('itemForm').reset();
      el('itemId').value = '';
    });

    el('stageForm').addEventListener('submit', function (e) {
      e.preventDefault();
      Store.upsert(Store.data.stages, {
        id: el('stageId').value || '',
        name: el('stageName').value.trim(),
        location: el('stageLocation').value.trim(),
        incharge: el('stageIncharge').value.trim(),
        priestInCharge: el('stagePriestIncharge').value.trim(),
        competitionItemId: el('stageCompetitionItem').value,
        competitionCategory: el('stageCompetitionCategory').value,
        upNextItemId: el('stageUpNextItem').value,
        upNextCategory: el('stageUpNextCategory').value
      });
      el('stageForm').reset();
      el('stageId').value = '';
      syncStageCategoryOptions('stageCompetitionItem', 'stageCompetitionCategory');
      syncStageCategoryOptions('stageUpNextItem', 'stageUpNextCategory');
      el('stageEditor').open = false;
      refresh();
      toast('Stage saved');
    });
    el('stageReset').addEventListener('click', function () {
      el('stageForm').reset();
      el('stageId').value = '';
      syncStageCategoryOptions('stageCompetitionItem', 'stageCompetitionCategory');
      syncStageCategoryOptions('stageUpNextItem', 'stageUpNextCategory');
    });

    el('teamForm').addEventListener('submit', function (e) {
      e.preventDefault();
      Store.upsert(Store.data.teams, {
        id: el('teamId').value || '',
        name: el('teamName').value.trim(),
        short: el('teamShort').value.trim().toUpperCase(),
        color: el('teamColor').value
      });
      el('teamForm').reset();
      el('teamId').value = '';
      el('teamColor').value = '#2563eb';
      refresh();
      toast('Team saved');
    });
    el('teamReset').addEventListener('click', function () {
      el('teamForm').reset();
      el('teamId').value = '';
    });

    el('settingsForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var s = Store.data.settings;
      s.eventName = el('setName').value.trim();
      s.subtitle = el('setSubtitle').value.trim();
      s.venue = el('setVenue').value.trim();
      s.dates = el('setDates').value.trim();
      s.liveMessage = el('setLive').value.trim();
      Store.save();
      el('eventDetailsEditor').open = false;
      refresh();
      toast('Event details updated');
    });

    el('pointsForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var p = Store.data.settings.points;
      p.singleFirst = Number(el('singleFirst').value) || 0;
      p.singleSecond = Number(el('singleSecond').value) || 0;
      p.singleThird = Number(el('singleThird').value) || 0;
      p.groupFirst = Number(el('groupFirst').value) || 0;
      p.groupSecond = Number(el('groupSecond').value) || 0;
      p.groupThird = Number(el('groupThird').value) || 0;
      p.singleGradeA = Number(el('singleGradeA').value) || 0;
      p.singleGradeB = Number(el('singleGradeB').value) || 0;
      p.singleGradeC = Number(el('singleGradeC').value) || 0;
      p.singleGradeD = Number(el('singleGradeD').value) || 0;
      p.singleGradeE = Number(el('singleGradeE').value) || 0;
      p.groupGradeA = Number(el('groupGradeA').value) || 0;
      p.groupGradeB = Number(el('groupGradeB').value) || 0;
      p.groupGradeC = Number(el('groupGradeC').value) || 0;
      p.groupGradeD = Number(el('groupGradeD').value) || 0;
      p.groupGradeE = Number(el('groupGradeE').value) || 0;
      Store.save();
      el('pointsEditor').open = false;
      refresh();
      toast('Points scheme updated');
    });

    el('passwordForm').addEventListener('submit', function (e) {
      e.preventDefault();
      if (el('pwNew').value !== el('pwConfirm').value) {
        toast('New passwords do not match');
        return;
      }
      Store.changePassword(el('pwCurrent').value, el('pwNew').value).then(function (ok) {
        toast(ok ? 'Password changed' : 'Current password is incorrect');
        if (ok) {
          el('passwordForm').reset();
          el('passwordEditor').open = false;
        }
      });
    });
  }

  /* ---------------- list actions ---------------- */
  function bindListActions() {
    el('adminPanel').addEventListener('click', function (e) {
      var editBtn = e.target.closest('[data-edit]');
      var delBtn = e.target.closest('[data-del]');
      if (editBtn) return startEdit(editBtn.dataset.edit, editBtn.dataset.id);
      if (delBtn) return confirmDelete(delBtn.dataset.del, delBtn.dataset.id);
    });
  }

  function startEdit(kind, id) {
    if (kind === 'result') {
      var r = Store.byId(Store.data.results, id);
      if (!r) return;
      el('resultId').value = r.id;
      el('resultItem').value = r.itemId;
      var resultItem = Store.byId(Store.data.items, r.itemId);
      syncResultCategoryOptions();
      var savedCategory = r.category || (resultItem && resultItem.section) || '';
      el('resultCategory').value = itemCategories(resultItem).indexOf(savedCategory) !== -1
        ? savedCategory : itemCategories(resultItem)[0] || '';
      el('resultParish').value = r.parish || '';
      syncUnitOptions();
      el('resultUnit').value = resultItem && resultItem.type === 'Group'
        ? 'parish-group' : r.teamId || r.unit || '';
      el('resultParticipant').value = r.participant || '';
      el('resultPosition').value = String(r.position || 0);
      el('resultGrade').value = r.grade || '';
      el('resultEditor').open = true;
    } else if (kind === 'item') {
      var i = Store.byId(Store.data.items, id);
      if (!i) return;
      el('itemId').value = i.id;
      el('itemName').value = i.name;
      el('itemNameMl').value = i.nameMl || '';
      el('itemType').value = i.type;
      el('itemCategory').value = itemCategories(i)[0] || i.section || '';
      el('itemStage').value = i.stageId || '';
      el('itemStatus').value = i.status || 'Upcoming';
      el('itemTime').value = i.time || '';
      el('itemEditor').open = true;
    } else if (kind === 'stage') {
      var s = Store.byId(Store.data.stages, id);
      if (!s) return;
      el('stageId').value = s.id;
      el('stageName').value = s.name;
      el('stageLocation').value = s.location || '';
      el('stageIncharge').value = s.incharge || '';
      el('stagePriestIncharge').value = s.priestInCharge || '';
      el('stageCompetitionItem').value = s.competitionItemId || '';
      syncStageCategoryOptions('stageCompetitionItem', 'stageCompetitionCategory');
      el('stageCompetitionCategory').value = s.competitionCategory || '';
      el('stageUpNextItem').value = s.upNextItemId || '';
      syncStageCategoryOptions('stageUpNextItem', 'stageUpNextCategory');
      el('stageUpNextCategory').value = s.upNextCategory || '';
      el('stageEditor').open = true;
    } else if (kind === 'team') {
      var t = Store.byId(Store.data.teams, id);
      if (!t) return;
      el('teamId').value = t.id;
      el('teamName').value = t.name;
      el('teamShort').value = t.short || '';
      el('teamColor').value = t.color || '#2563eb';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('Loaded for editing');
  }

  function confirmDelete(kind, id) {
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    if (kind === 'result') {
      Store.remove(Store.data.results, id);
    } else if (kind === 'item') {
      Store.data.results = Store.data.results.filter(function (r) { return r.itemId !== id; });
      Store.remove(Store.data.items, id);
    } else if (kind === 'stage') {
      Store.data.items.forEach(function (i) { if (i.stageId === id) i.stageId = ''; });
      Store.remove(Store.data.stages, id);
    } else if (kind === 'team') {
      Store.data.results = Store.data.results.filter(function (r) { return r.teamId !== id; });
      Store.remove(Store.data.teams, id);
    }
    Store.save();
    refresh();
    toast('Deleted');
  }

  /* ---------------- data import / export ---------------- */
  function bindData() {
    el('exportStageReportBtn').addEventListener('click', function () {
      var rows = stageCompletionRows();
      if (!rows.length) {
        toast('No completed items to export');
        return;
      }
      function csv(value) {
        return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
      }
      var lines = [['Stage', 'Sequence', 'Item (English)', 'Item (Malayalam)', 'Category', 'Completed at', 'Scheduled time']];
      rows.forEach(function (row) {
        lines.push([
          row.stage,
          row.sequence,
          row.item.name || '',
          row.item.nameMl || '',
          row.category,
          row.item.completedAt ? new Date(row.item.completedAt).toISOString() : '',
          row.item.time || ''
        ]);
      });
      var content = '\uFEFF' + lines.map(function (line) { return line.map(csv).join(','); }).join('\r\n');
      var url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
      var a = document.createElement('a');
      a.href = url;
      a.download = 'stage-completion-report.csv';
      a.click();
      URL.revokeObjectURL(url);
    });

    el('exportBtn').addEventListener('click', function () {
      var payload = JSON.stringify(Store.data, null, 2);
      var blob = new Blob([payload], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'kalolsavam-data.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    el('importBtn').addEventListener('click', function () { el('importFile').click(); });

    el('importFile').addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var parsed = JSON.parse(reader.result);
          if (!parsed.settings || !Array.isArray(parsed.teams)) throw new Error('bad file');
          parsed.settings.passwordHash = Store.data.settings.passwordHash;
          Store.replaceAll(parsed);
          refresh();
          toast('Data imported');
        } catch (err) {
          toast('That file is not a valid export');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    el('resetDataBtn').addEventListener('click', function () {
      if (!confirm('Reset everything back to the demo data?')) return;
      Store.resetToSeed().then(function () {
        refresh();
        toast('Data reset');
      });
    });
  }

  function init() {
    bindLogin();
    bindTabs();
    bindForms();
    bindListActions();
    bindData();
    syncGate();
  }

  global.Admin = { init: init, syncGate: syncGate, renderAdmin: renderAdmin, toast: toast };
})(window);
