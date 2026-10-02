/* Data layer: seed data, persistence (localStorage) and score calculation. */
(function (global) {
  'use strict';

  var KEY = 'bible-kalolsavam-data-v1';
  var SESSION_KEY = 'bible-kalolsavam-session';
  var DEFAULT_PASSWORD = 'kalolsavam';

  function uid(prefix) {
    return prefix + '-' + Math.random().toString(36).slice(2, 9);
  }

  function seed() {
    return {
      settings: {
        eventName: 'Undancode Forane Bible Kalolsavam - 2026',
        subtitle: 'Live Scoreboard',
        venue: "St. Joseph's Forane Church, Undancode",
        dates: '10 October 2026',
        liveMessage: 'Live',
        adminUser: 'admin',
        passwordHash: '84aff1a5bae3531ee13f007cea16e2d87430edce78f5005db25411afdce0cac6',
        points: {
          singleFirst: 10, singleSecond: 7, singleThird: 5,
          groupFirst: 25, groupSecond: 15, groupThird: 10,
          singleGradeA: 10, singleGradeB: 7, singleGradeC: 5, singleGradeD: 3, singleGradeE: 1,
          groupGradeA: 25, groupGradeB: 15, groupGradeC: 10, groupGradeD: 7, groupGradeE: 5
        }
      },
      teams: [
        { id: 'tm-37d8v22', name: 'St. Mathew Unit', short: 'MAT', color: '#2563eb' },
        { id: 'tm-o2i3jtv', name: 'St. Mark Unit', short: 'MRK', color: '#16a34a' },
        { id: 'tm-7feukxw', name: 'St. Luke Unit', short: 'LUK', color: '#f59e0b' },
        { id: 'tm-ck7cr3v', name: 'St. John Unit', short: 'JHN', color: '#ec4899' }
      ],
      stations: [
        { id: 'sta-001', parish: 'Undencode', no: 1, substation: 'Undencode', score: 0 },
        { id: 'sta-002', parish: 'Undencode', no: 2, substation: 'Vencode', score: 0 },
        { id: 'sta-003', parish: 'Anappara', no: 3, substation: 'Anappara', score: 0 },
        { id: 'sta-004', parish: 'Anappara', no: 4, substation: 'Adeekkalam', score: 0 },
        { id: 'sta-005', parish: 'Kandamthitta', no: 5, substation: 'Kandamthitta', score: 0 },
        { id: 'sta-006', parish: 'Kandamthitta', no: 6, substation: 'Kurichi', score: 0 },
        { id: 'sta-007', parish: 'Kandamthitta', no: 7, substation: 'kuttamala', score: 0 },
        { id: 'sta-008', parish: 'Kiliyoor', no: 8, substation: 'Kiliyoor', score: 0 },
        { id: 'sta-009', parish: 'Kiliyoor', no: 9, substation: 'Kallimoodu', score: 0 },
        { id: 'sta-010', parish: 'Kiliyoor', no: 10, substation: 'Karimbumannadi', score: 0 },
        { id: 'sta-011', parish: 'Kurishumala', no: 11, substation: 'Kurishumala', score: 0 },
        { id: 'sta-012', parish: 'Kurishumala', no: 12, substation: 'Kollakonam', score: 0 },
        { id: 'sta-013', parish: 'Kurishumala', no: 13, substation: 'Koottappu', score: 0 },
        { id: 'sta-014', parish: 'Manivila', no: 14, substation: 'Manivila', score: 0 },
        { id: 'sta-015', parish: 'Manivila', no: 15, substation: 'Kadayivila', score: 0 },
        { id: 'sta-016', parish: 'Manivila', no: 16, substation: 'Nediyamcode', score: 0 },
        { id: 'sta-017', parish: 'Manivila', no: 17, substation: 'Manchavilaakam', score: 0 },
        { id: 'sta-018', parish: 'Panachamoodu', no: 18, substation: 'Panachamoodu', score: 0 },
        { id: 'sta-019', parish: 'Panachamoodu', no: 19, substation: 'Paravila', score: 0 },
        { id: 'sta-020', parish: 'Thresyapuram', no: 20, substation: 'Thresyapuram', score: 0 },
        { id: 'sta-021', parish: 'Thresyapuram', no: 21, substation: 'Karakkonam', score: 0 },
        { id: 'sta-022', parish: 'Thresyapuram', no: 22, substation: 'Kaivankala', score: 0 },
        { id: 'sta-023', parish: 'Vazhichal', no: 23, substation: 'Vazhichal', score: 0 },
        { id: 'sta-024', parish: 'Vazhichal', no: 24, substation: 'Chettikunnu', score: 0 },
        { id: 'sta-025', parish: 'Vazhichal', no: 25, substation: 'Perekkonam', score: 0 },
        { id: 'sta-026', parish: 'Vazhichal', no: 26, substation: 'Tholikkottukonam', score: 0 },
        { id: 'sta-027', parish: 'Mullilavuvila', no: 27, substation: 'Mullilavuvila', score: 0 }
      ],
      stages: [
        { id: 'stg-0qb8qfh', name: 'Stage 1', location: 'Parish Auditorium', incharge: 'Mr. Sijin Felix', priestInCharge: 'Fr. Robin C. Peter' },
        { id: 'stg-5a9c6w5', name: 'Stage 2', location: 'Sunday School Block', incharge: 'Mr. Anoop', priestInCharge: 'Fr. Sujin' },
        { id: 'stg-l9sdrca', name: 'Stage 3', location: 'Open Ground', incharge: 'Mr. Binu Raj', priestInCharge: 'Fr. Sebastian' },
        { id: 'stg-4f7c2a1', name: 'Stage 4', location: '', incharge: 'Mrs. Nisha Manivila', priestInCharge: 'Fr. Thomas Joosa O.Praem' }
      ],
      items: [
        { id: 'rec-zvpq4j4', code: 'A', name: 'Light Music (Male)', nameMl: 'ലളിതഗാനം (പുരുഷൻ)', type: 'Single', section: 'Junior', categories: ['Junior', 'Senior', 'Super Senior', 'Teachers'], stageId: '', time: '', status: 'Upcoming' },
        { id: 'rec-folk-dance', code: 'B', name: 'Folk Dance', nameMl: 'നാടോടിനൃത്തം', type: 'Single', section: 'Junior', categories: ['Junior', 'Senior', 'Super Senior', 'Teachers'], stageId: '', time: '', status: 'Upcoming' },
        { id: 'rec-wj1xp46', code: 'C', name: 'Elocution', nameMl: 'പ്രസംഗം', type: 'Single', section: 'Junior', categories: ['Junior', 'Senior', 'Super Senior', 'Teachers'], stageId: '', time: '', status: 'Upcoming' },
        { id: 'rec-fbgf3ol', code: 'D', name: 'Storytelling', nameMl: 'കഥാപ്രസംഗം', type: 'Single', section: 'Junior', categories: ['Junior', 'Senior', 'Super Senior', 'Teachers'], stageId: '', time: '', status: 'Upcoming' },
        { id: 'rec-9ih55rz', code: 'E', name: 'Psalm Singing', nameMl: 'സങ്കീർത്തനാലാപനം', type: 'Single', section: 'Junior', categories: ['Junior', 'Senior', 'Super Senior', 'Teachers'], stageId: '', time: '', status: 'Upcoming' },
        { id: 'rec-margamkali', code: 'F', name: 'Margamkali', nameMl: 'മാർഗംകളി', type: 'Group', section: 'Parish Group', categories: ['Parish Group'], stageId: '', time: '', status: 'Upcoming' },
        { id: 'rec-light-music-female', code: 'G', name: 'Light Music (Female)', nameMl: 'ലളിതഗാനം (വനിത)', type: 'Single', section: 'Junior', categories: ['Junior', 'Senior', 'Super Senior', 'Teachers'], stageId: '', time: '', status: 'Upcoming' },
        { id: 'rec-2r49lpt', code: 'H', name: 'Classical Music', nameMl: 'ശാസ്ത്രീയസംഗീതം', type: 'Single', section: 'Junior', categories: ['Junior', 'Senior', 'Super Senior', 'Teachers'], stageId: '', time: '', status: 'Upcoming' },
        { id: 'itm-nmc4wq6', code: 'I', name: 'Bible Quiz', nameMl: 'ബൈബിൾ ക്വിസ്', type: 'Group', section: 'Junior', categories: ['Junior', 'Senior', 'Super Senior', 'Teachers'], stageId: 'stg-0qb8qfh', time: '', status: 'Completed' },
        { id: 'rec-one-act-play', code: 'J', name: 'One-Act Play / Drama', nameMl: 'ഏകാങ്കനാടകം', type: 'Group', section: 'Parish Group', categories: ['Parish Group'], stageId: '', time: '', status: 'Upcoming' },
        { id: 'rec-street-play', code: 'K', name: 'Street Play', nameMl: 'തെരുവുനാടകം', type: 'Group', section: 'Parish Group', categories: ['Parish Group'], stageId: '', time: '', status: 'Upcoming' },
        { id: 'rec-4qpc8ru', code: 'L', name: 'Storytelling (Sub-Junior)', nameMl: 'കഥ പറയൽ', type: 'Single', section: 'Sub Junior', categories: ['Sub Junior'], stageId: '', time: '', status: 'Upcoming' },
        { id: 'rec-ytht2rz', code: 'M', name: 'Action Song', nameMl: 'അഭിനയഗാനം', type: 'Single', section: 'Sub Junior', categories: ['Sub Junior'], stageId: '', time: '', status: 'Upcoming' }
      ],
      results: [
        { id: 'res-ofbvoew', itemId: 'itm-nmc4wq6', teamId: 'tm-37d8v22', participant: 'Team A', position: 1, grade: 'A', at: 1790670203611 },
        { id: 'res-0s1sggx', itemId: 'itm-nmc4wq6', teamId: 'tm-7feukxw', participant: 'Team C', position: 2, grade: 'B', at: 1790670303611 },
        { id: 'res-102hf71', itemId: 'itm-nmc4wq6', teamId: 'tm-o2i3jtv', participant: 'Team B', position: 3, grade: 'B', at: 1790670403611 }
      ]
    };
  }

  function itemCategories(item) {
    if (item && Array.isArray(item.categories) && item.categories.length) return item.categories;
    if (item && item.type === 'Group') return ['Parish Group'];
    if (item && item.section && item.section !== 'All') return [item.section];
    return ['Junior', 'Senior', 'Super Senior', 'Teachers', 'Sub Junior'];
  }

  function categorySlug(category) {
    return String(category).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'category';
  }

  function splitItemsByCategory(items) {
    var splitItems = [];
    var itemMap = {};
    var originalById = {};
    var usedIds = {};
    items.forEach(function (item) { if (item.id) usedIds[item.id] = true; });
    items.forEach(function (item) {
      if (!item.id) item.id = uid('itm');
      originalById[item.id] = item;
      var categories = itemCategories(item).filter(function (category, index, list) {
        return category && list.indexOf(category) === index;
      });
      var primary = categories.indexOf(item.section) !== -1 ? item.section : categories[0];
      categories = [primary].concat(categories.filter(function (category) { return category !== primary; }));
      itemMap[item.id] = {};
      categories.forEach(function (category, index) {
        var id = item.id;
        if (index > 0) {
          var baseId = item.id + '--' + categorySlug(category);
          id = baseId;
          var suffix = 2;
          while (usedIds[id]) id = baseId + '-' + suffix++;
          usedIds[id] = true;
        }
        var variant = Object.assign({}, item, {
          id: id,
          baseItemId: item.id,
          section: category,
          categories: [category]
        });
        itemMap[item.id][category] = id;
        splitItems.push(variant);
      });
    });
    return { items: splitItems, itemMap: itemMap, originalById: originalById };
  }

  function remapCategoryReference(record, itemKey, categoryKey, split) {
    var originalId = record[itemKey];
    var categoryMap = split.itemMap[originalId];
    if (!categoryMap) return;
    var originalItem = split.originalById[originalId];
    var category = record[categoryKey] || originalItem.section || itemCategories(originalItem)[0];
    var targetId = categoryMap[category] || categoryMap[Object.keys(categoryMap)[0]];
    if (!targetId) return;
    record[itemKey] = targetId;
    record[categoryKey] = category;
  }

  var data = null;
  var isLoading = false;
  var supabaseClient = null;
  var supabaseConfigured = false;
  var remoteAdminSession = false;
  var remoteLoadPromise = Promise.resolve(false);
  var remoteSaveQueue = Promise.resolve();

  function configureSupabase() {
    if (supabaseConfigured) return supabaseClient;
    supabaseConfigured = true;
    var config = global.KALOLSAVAM_SUPABASE_CONFIG || {};
    if (!config.url || !config.anonKey || !global.supabase || !global.supabase.createClient) return null;

    sessionStorage.removeItem(SESSION_KEY);
    supabaseClient = global.supabase.createClient(config.url, config.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    supabaseClient.auth.onAuthStateChange(function (_, session) {
      var role = session && session.user && session.user.app_metadata && session.user.app_metadata.role;
      remoteAdminSession = role === 'admin';
      if (remoteAdminSession) sessionStorage.setItem(SESSION_KEY, '1');
      else sessionStorage.removeItem(SESSION_KEY);
      global.dispatchEvent(new Event('kalolsavam-auth-update'));
    });
    supabaseClient.channel('kalolsavam-state')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'kalolsavam_state', filter: 'id=eq.main'
      }, function (payload) {
        if (payload.new && payload.new.data) applyRemoteState(payload.new.data);
      })
      .subscribe();
    return supabaseClient;
  }

  function persistLocal() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Unable to persist data', e);
    }
  }

  function applyRemoteState(remoteData) {
    if (!remoteData || typeof remoteData !== 'object') return;
    data = remoteData;
    persistLocal();
    global.dispatchEvent(new Event('kalolsavam-remote-update'));
  }

  function loadRemoteState() {
    if (!configureSupabase()) return Promise.resolve(false);
    return supabaseClient.from('kalolsavam_state').select('data').eq('id', 'main').maybeSingle()
      .then(function (response) {
        if (response.error) {
          console.warn('Unable to load shared scoreboard state', response.error.message);
          return false;
        }
        if (!response.data || !response.data.data) return false;
        applyRemoteState(response.data.data);
        return true;
      }).catch(function (error) {
        console.warn('Unable to load shared scoreboard state', error);
        return false;
      });
  }

  function saveRemoteState() {
    if (!supabaseClient || !remoteAdminSession) return Promise.resolve(false);
    var snapshot = JSON.parse(JSON.stringify(data));
    if (snapshot.settings) delete snapshot.settings.passwordHash;
    return supabaseClient.from('kalolsavam_state').upsert({
      id: 'main', data: snapshot, updated_at: new Date().toISOString()
    }).then(function (response) {
      if (response.error) throw response.error;
      return true;
    }).catch(function (error) {
      console.error('Unable to sync scoreboard state to Supabase', error);
      return false;
    });
  }

  function load() {
    isLoading = true;
    configureSupabase();
    try {
      var raw = localStorage.getItem(KEY);
      data = raw ? JSON.parse(raw) : seed();
    } catch (e) {
      data = seed();
    }
    if (!data || !data.settings) data = seed();
    var catalogItems = splitItemsByCategory(seed().items).items;
    var savedItems = Array.isArray(data.items) ? data.items : [];
    var catalogChanged = !Array.isArray(data.items);
    if (data.categorySplitVersion !== 1) {
      var migrationItems = savedItems.length ? savedItems : seed().items;
      var split = splitItemsByCategory(migrationItems);
      data.items = split.items;
      data.results = Array.isArray(data.results) ? data.results : [];
      data.results.forEach(function (result) {
        var categoryMap = split.itemMap[result.itemId];
        if (!categoryMap) return;
        var originalItem = split.originalById[result.itemId];
        var category = result.category || originalItem.section || itemCategories(originalItem)[0];
        result.itemId = categoryMap[category] || categoryMap[Object.keys(categoryMap)[0]];
      });
      (Array.isArray(data.stages) ? data.stages : []).forEach(function (stage) {
        remapCategoryReference(stage, 'competitionItemId', 'competitionCategory', split);
        remapCategoryReference(stage, 'upNextItemId', 'upNextCategory', split);
      });
      savedItems = data.items;
      data.categorySplitVersion = 1;
      catalogChanged = true;
    }
    savedItems.forEach(function (item) {
      if (item.baseItemId) return;
      var category = itemCategories(item)[0];
      var suffix = '--' + categorySlug(category);
      var baseId = item.id.slice(-suffix.length) === suffix
        ? item.id.slice(0, -suffix.length) : '';
      var baseItem = baseId ? byId(savedItems, baseId) : null;
      item.baseItemId = baseItem && baseItem.name === item.name && baseItem.code === item.code
        ? baseId : item.id;
      catalogChanged = true;
    });
    var syncedItems = catalogItems.map(function (catalogItem) {
      var existing = byId(savedItems, catalogItem.id);
      if (!existing) {
        catalogChanged = true;
        return catalogItem;
      }
      if (existing.code !== catalogItem.code || existing.name !== catalogItem.name ||
          existing.nameMl !== catalogItem.nameMl || existing.type !== catalogItem.type ||
          existing.baseItemId !== catalogItem.baseItemId ||
          existing.section !== catalogItem.section ||
          JSON.stringify(existing.categories || []) !== JSON.stringify(catalogItem.categories)) {
        catalogChanged = true;
      }
      existing.code = catalogItem.code;
      existing.name = catalogItem.name;
      existing.nameMl = catalogItem.nameMl;
      existing.type = catalogItem.type;
      existing.baseItemId = catalogItem.baseItemId;
      existing.section = catalogItem.section;
      existing.categories = catalogItem.categories.slice();
      return existing;
    });
    savedItems.forEach(function (item) {
      if (!byId(catalogItems, item.id)) syncedItems.push(item);
    });
    data.items = syncedItems;
    if (catalogChanged) save();
    if (!Array.isArray(data.stations)) {
      data.stations = seed().stations;
      save();
    }
    if (data.stageSetupVersion !== 2) {
      var defaultStages = seed().stages;
      if (!Array.isArray(data.stages)) {
        data.stages = defaultStages;
      } else {
        var firstStage = byId(data.stages, 'stg-0qb8qfh');
        if (firstStage && firstStage.name === 'Main Stage') firstStage.name = 'Stage 1';
        var hasStageFour = data.stages.some(function (stage) { return stage.name === 'Stage 4'; });
        if (!hasStageFour) data.stages.push(defaultStages[3]);
      }
      defaultStages.forEach(function (defaultStage) {
        var stage = byId(data.stages, defaultStage.id) || data.stages.find(function (entry) {
          return entry.name === defaultStage.name;
        });
        if (!stage) return;
        stage.name = defaultStage.name;
        stage.incharge = defaultStage.incharge;
        stage.priestInCharge = defaultStage.priestInCharge;
      });
      data.stageSetupVersion = 2;
      save();
    }
    var defaultPoints = seed().settings.points;
    var configuredPoints = data.settings.points || {};
    var pointsChanged = false;
    Object.keys(defaultPoints).forEach(function (key) {
      var value = configuredPoints[key];
      if (value === null || value === '' || !Number.isFinite(Number(value))) {
        configuredPoints[key] = defaultPoints[key];
        pointsChanged = true;
      } else {
        configuredPoints[key] = Number(value);
      }
    });
    data.settings.points = configuredPoints;
    if (pointsChanged) save();
    if ((data.settings.eventName === 'Bible Kalolsavam' && data.settings.subtitle === 'Live Score Board') ||
        (data.settings.eventName === 'Undenkode Fornane' && data.settings.subtitle === 'Bible Kalolsavam - 2026') ||
        data.settings.eventName === 'Undenkode Fornane Bible Kalolsavam - 2026') {
      data.settings.eventName = 'Undancode Forane Bible Kalolsavam - 2026';
      data.settings.venue = (data.settings.venue || '').replace(/Undenkode/g, 'Undancode');
      data.settings.subtitle = 'Live Scoreboard';
      save();
    }
    if (data.settings.liveMessage === 'Results are being updated live from the stages.') {
      data.settings.liveMessage = 'Live';
      save();
    }
    isLoading = false;
    remoteLoadPromise = loadRemoteState();
    return data;
  }

  function save() {
    persistLocal();
    if (isLoading || !supabaseClient || !remoteAdminSession) return;
    var ready = remoteLoadPromise;
    remoteSaveQueue = remoteSaveQueue.catch(function () { return false; })
      .then(function () { return ready; })
      .then(saveRemoteState);
  }

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function upsert(list, record) {
    if (record.id) {
      var existing = byId(list, record.id);
      if (existing) {
        Object.keys(record).forEach(function (k) { existing[k] = record[k]; });
        save();
        return existing;
      }
    }
    record.id = record.id || uid('rec');
    list.push(record);
    save();
    return record;
  }

  function remove(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { list.splice(i, 1); save(); return true; }
    }
    return false;
  }

  /* -------- scoring -------- */
  function pointsFor(result) {
    var p = data.settings.points || {};
    var item = byId(data.items, result.itemId);
    var group = item && item.type === 'Group';
    var category = group ? 'group' : 'single';
    var position = Number(result.position);
    function configured(key) {
      var value = Number(p[key]);
      return Number.isFinite(value) ? value : 0;
    }
    var place = 0;
    if (position === 1) place = configured(category + 'First');
    else if (position === 2) place = configured(category + 'Second');
    else if (position === 3) place = configured(category + 'Third');
    var grade = 0;
    if (result.grade && 'ABCDE'.indexOf(result.grade) !== -1) {
      grade = configured(category + 'Grade' + result.grade);
    }
    return Math.round(place + grade);
  }

  function standings() {
    var totals = {};
    data.teams.forEach(function (team) {
      totals[team.id] = { team: team, points: 0, first: 0, second: 0, third: 0, entries: 0 };
    });
    data.results.forEach(function (r) {
      var row = totals[r.teamId];
      if (!row) return;
      var position = Number(r.position);
      row.points += pointsFor(r);
      row.entries += 1;
      if (position === 1) row.first += 1;
      else if (position === 2) row.second += 1;
      else if (position === 3) row.third += 1;
    });
    var list = Object.keys(totals).map(function (k) { return totals[k]; });
    list.sort(function (a, b) {
      return b.points - a.points || b.first - a.first || b.second - a.second ||
        a.team.name.localeCompare(b.team.name);
    });
    var rank = 0, prev = null;
    list.forEach(function (row, idx) {
      if (prev === null || row.points !== prev) { rank = idx + 1; prev = row.points; }
      row.rank = rank;
    });
    return list;
  }

  function parishStandings() {
    var parishMap = {};
    function ensureParish(name) {
      if (!parishMap[name]) parishMap[name] = { parish: name, total: 0, units: {} };
      return parishMap[name];
    }
    (Array.isArray(data.stations) ? data.stations : []).forEach(function (station) {
      var parish = (station.parish || '').trim();
      var unit = (station.substation || station.name || '').trim();
      if (!parish || !unit) return;
      ensureParish(parish).units[unit] = 0;
    });
    data.results.forEach(function (result) {
      var station = Array.isArray(data.stations) ? data.stations.find(function (entry) {
        return (entry.id || entry.substation) === result.teamId;
      }) : null;
      var parish = (result.parish || station && station.parish || '').trim();
      var unit = (result.unit || station && station.substation || '').trim();
      if (!parish || !unit) return;
      var parishRow = ensureParish(parish);
      var points = pointsFor(result);
      parishRow.total += points;
      parishRow.units[unit] = (parishRow.units[unit] || 0) + points;
    });
    var list = Object.keys(parishMap).map(function (key) {
      var parish = parishMap[key];
      var units = Object.keys(parish.units).map(function (unit) {
        return { unit: unit, points: parish.units[unit] };
      }).sort(function (a, b) { return a.points - b.points || a.unit.localeCompare(b.unit); });
      return { parish: parish.parish, total: parish.total, units: units };
    }).sort(function (a, b) { return b.total - a.total || a.parish.localeCompare(b.parish); });
    var rank = 0, previousTotal = null;
    list.forEach(function (row, index) {
      if (previousTotal === null || row.total !== previousTotal) {
        rank = index + 1;
        previousTotal = row.total;
      }
      row.rank = rank;
    });
    return list;
  }

  function resultsByItem() {
    var map = {};
    data.results.forEach(function (r) {
      (map[r.itemId] = map[r.itemId] || []).push(r);
    });
    Object.keys(map).forEach(function (k) {
      map[k].sort(function (a, b) {
        var ap = a.position || 99, bp = b.position || 99;
        return ap - bp;
      });
    });
    return map;
  }

  /* -------- auth (client-side gate) -------- */
  function sha256(text) {
    if (global.crypto && global.crypto.subtle) {
      var bytes = new TextEncoder().encode(text);
      return global.crypto.subtle.digest('SHA-256', bytes).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) {
          return ('0' + b.toString(16)).slice(-2);
        }).join('');
      });
    }
    // Fallback for non-secure contexts (file://) — weaker, but keeps the app usable.
    var h = 5381;
    for (var i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    return Promise.resolve('fallback-' + (h >>> 0).toString(16));
  }

  function ensurePasswordHash() {
    if (data.settings.passwordHash) return Promise.resolve();
    return sha256(DEFAULT_PASSWORD).then(function (hash) {
      data.settings.passwordHash = hash;
      save();
    });
  }

  function login(user, password) {
    var client = configureSupabase();
    if (client) {
      return client.auth.signInWithPassword({ email: user, password: password }).then(function (response) {
        var account = response.data && response.data.user;
        var role = account && account.app_metadata && account.app_metadata.role;
        if (response.error || role !== 'admin') {
          if (account) client.auth.signOut();
          sessionStorage.removeItem(SESSION_KEY);
          remoteAdminSession = false;
          return false;
        }
        remoteAdminSession = true;
        sessionStorage.setItem(SESSION_KEY, '1');
        remoteLoadPromise = loadRemoteState();
        return remoteLoadPromise.then(function (found) {
          return found ? true : saveRemoteState().then(function () { return true; });
        });
      }).catch(function (error) {
        console.warn('Supabase sign-in failed', error);
        return false;
      });
    }
    return ensurePasswordHash().then(function () {
      return sha256(password);
    }).then(function (hash) {
      var ok = user === data.settings.adminUser && hash === data.settings.passwordHash;
      if (ok) sessionStorage.setItem(SESSION_KEY, '1');
      return ok;
    });
  }

  function changePassword(current, next) {
    if (configureSupabase()) {
      return supabaseClient.auth.getUser().then(function (response) {
        var account = response.data && response.data.user;
        if (response.error || !account || !account.email) return false;
        return supabaseClient.auth.signInWithPassword({ email: account.email, password: current })
          .then(function (signInResponse) {
            if (signInResponse.error) return false;
            return supabaseClient.auth.updateUser({ password: next }).then(function (updateResponse) {
              return !updateResponse.error;
            });
          });
      }).catch(function (error) {
        console.warn('Supabase password update failed', error);
        return false;
      });
    }
    return sha256(current).then(function (hash) {
      if (hash !== data.settings.passwordHash) return false;
      return sha256(next).then(function (newHash) {
        data.settings.passwordHash = newHash;
        save();
        return true;
      });
    });
  }

  function isAuthed() { return sessionStorage.getItem(SESSION_KEY) === '1'; }
  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    remoteAdminSession = false;
    if (supabaseClient) supabaseClient.auth.signOut().catch(function (error) {
      console.warn('Supabase sign-out failed', error);
    });
  }

  function whenRemoteReady() { return remoteLoadPromise; }

  function replaceAll(next) {
    data = next;
    save();
  }

  function resetToSeed() {
    data = seed();
    save();
    return ensurePasswordHash();
  }

  global.Store = {
    uid: uid,
    load: load,
    whenRemoteReady: whenRemoteReady,
    save: save,
    byId: byId,
    upsert: upsert,
    remove: remove,
    pointsFor: pointsFor,
    standings: standings,
    parishStandings: parishStandings,
    resultsByItem: resultsByItem,
    login: login,
    logout: logout,
    isAuthed: isAuthed,
    changePassword: changePassword,
    ensurePasswordHash: ensurePasswordHash,
    replaceAll: replaceAll,
    resetToSeed: resetToSeed,
    get data() { return data; }
  };
})(window);
