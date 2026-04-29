/* ============================================================
   LUMIÈRE CINEMA — app.js
   OOP Architecture: Classes + DataStore + App Controller
   ============================================================ */

'use strict';

// ============================================================
// ===== OOP CLASSES
// ============================================================

class User {
  constructor(id, username, password, role, name, email) {
    this._id       = id;
    this._username = username;
    this._password = password;
    this._role     = role;
    this._name     = name;
    this._email    = email;
  }
  get id()       { return this._id; }
  get username() { return this._username; }
  get role()     { return this._role; }
  get name()     { return this._name; }
  get email()    { return this._email; }
  authenticate(pw) { return this._password === pw; }
  toJSON() {
    return { id:this._id, username:this._username, password:this._password,
             role:this._role, name:this._name, email:this._email };
  }
}

class Customer extends User {
  constructor(id, username, password, name, email) {
    super(id, username, password, 'customer', name, email);
    this._bookings = [];
  }
  addBooking(b) { this._bookings.push(b); }
}

class Cashier extends User {
  constructor(id, username, password, name, email) {
    super(id, username, password, 'cashier', name, email);
  }
}

class Admin extends User {
  constructor(id, username, password, name, email) {
    super(id, username, password, 'admin', name, email);
  }
  generateReport(transactions) {
    const total = transactions.reduce((s, t) => s + t.amount, 0);
    return { count: transactions.length, total, avg: transactions.length ? total / transactions.length : 0 };
  }
}

class Movie {
  constructor(id, title, description, duration, genre, rating, poster, releaseDate) {
    this._id          = id;
    this._title       = title;
    this._description = description;
    this._duration    = duration;
    this._genre       = genre;
    this._rating      = rating;
    this._poster      = poster || '';
    this._releaseDate = releaseDate || '';
    this._isActive    = true;
  }
  get id()          { return this._id; }
  get title()       { return this._title; }
  get description() { return this._description; }
  get duration()    { return this._duration; }
  get genre()       { return this._genre; }
  get rating()      { return this._rating; }
  get poster()      { return this._poster; }
  get releaseDate() { return this._releaseDate; }
  get isActive()    { return this._isActive; }
  set title(v)       { this._title = v; }
  set description(v) { this._description = v; }
  set duration(v)    { this._duration = v; }
  set genre(v)       { this._genre = v; }
  set rating(v)      { this._rating = v; }
  set poster(v)      { this._poster = v; }
  set releaseDate(v) { this._releaseDate = v; }
  deactivate()       { this._isActive = false; }
  toJSON() {
    return { id:this._id, title:this._title, description:this._description,
             duration:this._duration, genre:this._genre, rating:this._rating,
             poster:this._poster, releaseDate:this._releaseDate, isActive:this._isActive };
  }
}

class Schedule {
  constructor(id, movieId, date, time, hallNumber) {
    this._id         = id;
    this._movieId    = movieId;
    this._date       = date;
    this._time       = time;
    this._hallNumber = hallNumber;
  }
  get id()         { return this._id; }
  get movieId()    { return this._movieId; }
  get date()       { return this._date; }
  get time()       { return this._time; }
  get hallNumber() { return this._hallNumber; }
  toJSON() {
    return { id:this._id, movieId:this._movieId, date:this._date,
             time:this._time, hallNumber:this._hallNumber };
  }
}

class Seat {
  constructor(row, number, type) {
    this._row    = row;
    this._number = number;
    this._type   = type || 'standard';
    this._status = 'available';
  }
  get row()      { return this._row; }
  get number()   { return this._number; }
  get type()     { return this._type; }
  get status()   { return this._status; }
  get seatCode() { return `${this._row}${this._number}`; }
  isAvailable()  { return this._status === 'available'; }
  reserve()      { this._status = 'occupied'; }
  release()      { this._status = 'available'; }
}

class Payment {
  constructor(id, amount, method) {
    this._id        = id;
    this._amount    = amount;
    this._method    = method;
    this._status    = 'pending';
    this._timestamp = new Date().toISOString();
  }
  get id()        { return this._id; }
  get amount()    { return this._amount; }
  get method()    { return this._method; }
  get status()    { return this._status; }
  get timestamp() { return this._timestamp; }
  processPayment() { this._status = 'completed'; return true; }
  toJSON() {
    return { id:this._id, amount:this._amount, method:this._method,
             status:this._status, timestamp:this._timestamp };
  }
}
class CashPayment  extends Payment { constructor(id, amt) { super(id, amt, 'Cash'); } }
class CardPayment  extends Payment { constructor(id, amt) { super(id, amt, 'Card'); } }
class GCashPayment extends Payment { constructor(id, amt) { super(id, amt, 'GCash'); } }
class MayaPayment  extends Payment { constructor(id, amt) { super(id, amt, 'Maya'); } }

class Ticket {
  constructor(id, movieTitle, scheduleInfo, seats, totalAmount, customerName) {
    this._id           = id;
    this._movieTitle   = movieTitle;
    this._scheduleInfo = scheduleInfo;
    this._seats        = seats;
    this._totalAmount  = totalAmount;
    this._customerName = customerName;
    this._issueDate    = new Date().toISOString();
    this._code         = 'LMR-' + Math.random().toString(36).substr(2,8).toUpperCase();
  }
  get code()         { return this._code; }
  get movieTitle()   { return this._movieTitle; }
  get totalAmount()  { return this._totalAmount; }
  get customerName() { return this._customerName; }

  getReceiptHTML() {
    return `
      <div class="ticket">
        <div class="ticket-header">
          <div class="ticket-cinema-name">Lumière Cinema</div>
          <div class="ticket-movie-name">${this._movieTitle}</div>
        </div>
        <div class="ticket-body">
          <div class="ticket-tear"><div class="ticket-tear-line"></div></div>
          <div class="ticket-details">
            <div>
              <div class="ticket-detail-label">Customer</div>
              <div class="ticket-detail-value">${this._customerName || 'Guest'}</div>
            </div>
            <div>
              <div class="ticket-detail-label">Booking Code</div>
              <div class="ticket-detail-value gold">${this._code}</div>
            </div>
            <div>
              <div class="ticket-detail-label">Date & Time</div>
              <div class="ticket-detail-value">${this._scheduleInfo}</div>
            </div>
            <div>
              <div class="ticket-detail-label">Seats</div>
              <div class="ticket-detail-value">${this._seats.join(', ')}</div>
            </div>
            <div>
              <div class="ticket-detail-label">Total Paid</div>
              <div class="ticket-detail-value gold">₱${this._totalAmount.toLocaleString()}</div>
            </div>
            <div>
              <div class="ticket-detail-label">Issued</div>
              <div class="ticket-detail-value">${new Date(this._issueDate).toLocaleDateString()}</div>
            </div>
          </div>
          <div class="ticket-qr">🎫</div>
          <div class="ticket-footer">Please present at entry</div>
        </div>
      </div>`;
  }
  toJSON() {
    return { id:this._id, code:this._code, movieTitle:this._movieTitle,
             scheduleInfo:this._scheduleInfo, seats:this._seats,
             totalAmount:this._totalAmount, customerName:this._customerName,
             issueDate:this._issueDate };
  }
}

class Booking {
  constructor(id, customerId, scheduleId, movieId, seats) {
    this._id         = id;
    this._customerId = customerId;
    this._scheduleId = scheduleId;
    this._movieId    = movieId;
    this._seats      = seats;
    this._status     = 'pending';
    this._payment    = null;
    this._ticket     = null;
    this._createdAt  = new Date().toISOString();
  }
  get id()      { return this._id; }
  get seats()   { return this._seats; }
  get status()  { return this._status; }
  get ticket()  { return this._ticket; }
  setPayment(p) { this._payment = p; }
  confirm()     { this._status = 'confirmed'; return true; }
  generateTicket(movieTitle, scheduleInfo, customerName, totalAmount) {
    this._ticket = new Ticket('T-'+Date.now(), movieTitle, scheduleInfo, this._seats, totalAmount, customerName);
    return this._ticket;
  }
}

class Transaction {
  constructor(id, bookingId, amount, paymentMethod, customerName, movieTitle, seats, scheduleInfo) {
    this._id            = id;
    this._bookingId     = bookingId;
    this._amount        = amount;
    this._paymentMethod = paymentMethod;
    this._customerName  = customerName;
    this._movieTitle    = movieTitle;
    this._seats         = seats;
    this._scheduleInfo  = scheduleInfo;
    this._timestamp     = new Date().toISOString();
  }
  get amount()    { return this._amount; }
  get totalAmount(){ return this._amount; }
  toJSON() {
    return { id:this._id, bookingId:this._bookingId, amount:this._amount,
             paymentMethod:this._paymentMethod, customerName:this._customerName,
             movieTitle:this._movieTitle, seats:this._seats,
             scheduleInfo:this._scheduleInfo, timestamp:this._timestamp };
  }
}

// ============================================================
// ===== DATA STORE
// ============================================================

class DataStore {
  constructor() {
    this.KEYS = {
      users:        'lm_users',
      movies:       'lm_movies',
      schedules:    'lm_schedules',
      seats:        'lm_seats',
      transactions: 'lm_transactions',
      pricing:      'lm_pricing',
    };
    this._init();
  }

  // Call this to wipe everything and re-seed (used by "Reset Data" button)
  hardReset() {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
    this._init();
  }

  _init() {
    if (!localStorage.getItem(this.KEYS.users))        this._seedUsers();
    if (!localStorage.getItem(this.KEYS.movies))       this._seedMovies();
    if (!localStorage.getItem(this.KEYS.schedules))    this._seedSchedules();
    if (!localStorage.getItem(this.KEYS.seats))        this._seedSeats();
    if (!localStorage.getItem(this.KEYS.transactions)) this._save(this.KEYS.transactions, []);
    if (!localStorage.getItem(this.KEYS.pricing))      this._seedPricing();
  }

  _save(key, data)  { localStorage.setItem(key, JSON.stringify(data)); }
  _load(key)        { return JSON.parse(localStorage.getItem(key) || 'null'); }

  _seedUsers() {
    this._save(this.KEYS.users, [
      { id:'u1', username:'customer', password:'cinema123', role:'customer', name:'Maria Santos',   email:'maria@email.com' },
      { id:'u2', username:'cashier',  password:'pos456',    role:'cashier',  name:'Jose Reyes',     email:'jose@lumiere.com' },
      { id:'u3', username:'admin',    password:'admin789',  role:'admin',    name:'Ana Dela Cruz',  email:'ana@lumiere.com' },
    ]);
  }

  _seedMovies() {
    this._save(this.KEYS.movies, [
      {
        id:'m1', title:'Michael', releaseDate:'April 24, 2026',
        description:'Directed by Antoine Fuqua, this riveting biopic follows Michael Jackson from childhood to the height of his fame, starring his nephew Jaafar Jackson in an acclaimed performance as the King of Pop.',
        duration:'2h 28m', genre:'Musical / Biography', rating:'PG-13',
        poster:'images/Michael.jpg',
        isActive:true
      },
      {
        id:'m2', title:'The Super Mario Galaxy Movie', releaseDate:'April 1, 2026',
        description:'Mario and Luigi blast off into a cosmic adventure to stop Bowser Jr. from freeing his father and terrorizing the galaxy. A sequel to the record-breaking Super Mario Bros. Movie.',
        duration:'1h 38m', genre:'Animation / Adventure', rating:'PG',
        poster:'images/SuperMario.jpg',
        isActive:true
      },
      {
        id:'m3', title:"Lee Cronin's The Mummy", releaseDate:'April 17, 2026',
        description:"From the director of Evil Dead Rise comes a terrifying reimagining of the classic horror franchise. A family's life is shattered after a chilling encounter with an ancient evil in the desert.",
        duration:'1h 55m', genre:'Horror / Supernatural', rating:'R',
        poster:'images/TheMummy.jpg',
        isActive:true
      },
      {
        id:'m4', title:'Mother Mary', releaseDate:'April 24, 2026',
        description:"An A24 film starring Anne Hathaway and Michaela Coel. An iconic pop star and her estranged best friend reunite on the eve of a high-stakes comeback — unraveling secrets that could destroy everything.",
        duration:'2h 05m', genre:'Musical / Drama / Thriller', rating:'R',
        poster:'images/MotherMary.jpg',
        isActive:true
      },
      {
        id:'m5', title:'The Devil Wears Prada 2', releaseDate:'May 1, 2026',
        description:'Nearly 20 years later, Meryl Streep, Anne Hathaway, and Emily Blunt return as Miranda Priestly faces off against her former assistant-turned-rival in the cutthroat world of high fashion.',
        duration:'2h 10m', genre:'Comedy / Drama', rating:'PG-13',
        poster:'images/DevilWearsPrada2.jpg',
        isActive:true
      },
      {
        id:'m6', title:'Mortal Kombat II', releaseDate:'May 8, 2026',
        description:'The ultimate tournament returns. Karl Urban joins the franchise as fan-favorite Johnny Cage in this direct sequel to the 2021 reboot — more brutal, more spectacular, FINISH HIM.',
        duration:'2h 15m', genre:'Action / Fantasy', rating:'R',
        poster:'',
      },
      {
        id:'m7', title:'The Mandalorian & Grogu', releaseDate:'May 22, 2026',
        description:"Star Wars returns to the big screen. Pedro Pascal and Baby Yoda embark on an epic galactic adventure alongside Sigourney Weaver, directed by Jon Favreau. This is the way.",
        duration:'2h 20m', genre:'Sci-Fi / Adventure', rating:'PG-13',
        poster:'images/Mandalorian.jpg',
        isActive:true
      },
      {
        id:'m8', title:'Toy Story 5', releaseDate:'June 19, 2026',
        description:"Woody, Buzz, and the whole gang face their greatest threat yet — the digital age. Pixar's most anticipated sequel in years reunites Tom Hanks and Tim Allen for one last adventure.",
        duration:'1h 52m', genre:'Animation / Family', rating:'G',
        poster:'images/ToyStory5.jpg',
        isActive:true
      },
    ]);
  }

  _seedSchedules() {
    const today = new Date();
    const dates = [0,1,2].map(d => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + d);
      return dt.toISOString().split('T')[0];
    });
    const times = ['10:00 AM','1:30 PM','4:30 PM','7:30 PM','10:00 PM'];
    const movieIds = ['m1','m2','m3','m4','m5','m6','m7','m8'];
    const schedules = [];
    let sid = 1;
    movieIds.forEach(mid => {
      dates.forEach((date, di) => {
        times.slice(0, di === 0 ? 3 : 5).forEach(time => {
          schedules.push({ id:'s'+sid++, movieId:mid, date, time, hallNumber: Math.ceil(Math.random()*3) });
        });
      });
    });
    this._save(this.KEYS.schedules, schedules);
  }

  _seedSeats() {
    const schedules = this._load(this.KEYS.schedules) || [];
    const seats = {};
    schedules.forEach(s => { seats[s.id] = this._makeSeatMap(); });
    this._save(this.KEYS.seats, seats);
  }

  _makeSeatMap() {
    const map = {};
    ['A','B','C','D','E','F','G','H'].forEach(row => {
      for (let n = 1; n <= 10; n++) {
        map[row+n] = {
          row, number:n,
          type: row <= 'B' ? 'premium' : 'standard',
          status: Math.random() < 0.2 ? 'occupied' : 'available'
        };
      }
    });
    return map;
  }

  _seedPricing() {
    this._save(this.KEYS.pricing, { standard:280, premium:420, serviceFee:50 });
  }

  // ── Getters ──
  getUsers()        { return this._load(this.KEYS.users)        || []; }
  getMovies()       { return this._load(this.KEYS.movies)       || []; }
  getSchedules()    { return this._load(this.KEYS.schedules)    || []; }
  getSeats()        { return this._load(this.KEYS.seats)        || {}; }
  getTransactions() { return this._load(this.KEYS.transactions) || []; }
  getPricing()      { return this._load(this.KEYS.pricing)      || { standard:280, premium:420, serviceFee:50 }; }

  // ── Auth ──
  authenticate(username, password) {
    return this.getUsers().find(u => u.username === username && u.password === password) || null;
  }

  // ── Movies CRUD ──
  saveMovies(list) { this._save(this.KEYS.movies, list); }
  addMovie(movie)  { const list = this.getMovies(); list.push(movie.toJSON()); this.saveMovies(list); }
  updateMovie(id, data) {
    const list = this.getMovies();
    const i = list.findIndex(m => m.id === id);
    if (i > -1) { Object.assign(list[i], data); this.saveMovies(list); return true; }
    return false;
  }
  deleteMovie(id) { this.saveMovies(this.getMovies().filter(m => m.id !== id)); }

  // ── Schedules CRUD ──
  saveSchedules(list) { this._save(this.KEYS.schedules, list); }
  addSchedule(sched) {
    const list = this.getSchedules();
    list.push(sched.toJSON());
    this.saveSchedules(list);
    // Create a fresh seat map for this new schedule
    const seats = this.getSeats();
    seats[sched.id] = this._makeSeatMap();
    this._save(this.KEYS.seats, seats);
  }
  deleteSchedule(id) {
    this.saveSchedules(this.getSchedules().filter(s => s.id !== id));
    const seats = this.getSeats();
    delete seats[id];
    this._save(this.KEYS.seats, seats);
  }

  // ── Seats ──
  reserveSeats(scheduleId, codes) {
    const seats = this.getSeats();
    const map = seats[scheduleId];
    if (!map) return false;
    // Check all still available
    for (const code of codes) {
      if (!map[code] || map[code].status === 'occupied') return false;
    }
    codes.forEach(code => { map[code].status = 'occupied'; });
    this._save(this.KEYS.seats, seats);
    return true;
  }

  // ── Transactions ──
  addTransaction(txn) {
    const list = this.getTransactions();
    list.unshift(txn.toJSON());
    this._save(this.KEYS.transactions, list);
  }

  // ── Pricing ──
  savePricing(p) { this._save(this.KEYS.pricing, p); }
}

// ============================================================
// ===== APP CONTROLLER
// ============================================================

const DB = new DataStore();

const App = {
  // State
  currentUser:          null,
  selectedRole:         'customer',
  currentMovie:         null,
  currentSchedule:      null,
  selectedSeats:        [],
  currentPaymentMethod: 'cash',
  cashierMovie:         null,
  cashierSchedule:      null,
  cashierSelectedSeats: [],
  _cashierTotal:        0,
  _payTotal:            0,
  currentAdminTab:      'movies',

  // ─── HELPERS ────────────────────────────────────────────

  notify(msg, type = 'info') {
    const container = document.getElementById('notif-container');
    const el = document.createElement('div');
    el.className = `notif ${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  },

  showModal(html) {
    document.getElementById('modal-container').innerHTML = `
      <div class="modal-overlay" onclick="if(event.target===this)App.closeModal()">
        <div class="modal">${html}</div>
      </div>`;
  },
  closeModal() { document.getElementById('modal-container').innerHTML = ''; },

  // Render a poster img or placeholder
  posterHTML(movie, width, height) {
    const w = width  || '100%';
    const h = height || '100%';
    if (movie.poster) {
      return `<img src="${movie.poster}" alt="${movie.title} poster" loading="lazy"
        style="width:${w};height:${h};object-fit:cover;display:block"
        onerror="this.outerHTML='<div class=\\'poster-placeholder\\'><span>🎬</span><p>Poster Coming Soon</p></div>'">`;
    }
    return `<div class="poster-placeholder"><span>🎬</span><p>Poster Coming Soon</p></div>`;
  },

  // ─── AUTH ────────────────────────────────────────────────

  selectRole(role) {
    this.selectedRole = role;
    document.querySelectorAll('.role-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.role === role));
  },

  login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    if (!username || !password) { this.notify('Please enter your credentials', 'error'); return; }
    const user = DB.authenticate(username, password);
    if (!user) { this.notify('Invalid username or password', 'error'); return; }
    if (user.role !== this.selectedRole) {
      this.notify(`This account is a "${user.role}" account. Please select the correct role.`, 'error'); return;
    }
    this.currentUser = user;
    this.notify(`Welcome, ${user.name}!`, 'success');
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('app-nav').classList.remove('hidden');
    this._setupNav();
    if (user.role === 'customer')    this.navigate('home');
    else if (user.role === 'cashier') this.navigate('cashier');
    else                              this.navigate('admin');
  },

  logout() {
    this.currentUser         = null;
    this.selectedSeats       = [];
    this.cashierSelectedSeats = [];
    this.currentMovie        = null;
    this.currentSchedule     = null;
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('app-nav').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
  },

  _setupNav() {
    const u = this.currentUser;
    document.getElementById('nav-username').textContent = u.name;
    document.getElementById('nav-avatar').textContent   = u.name[0].toUpperCase();
    const links = document.getElementById('nav-links');
    if (u.role === 'customer') {
      links.innerHTML = `<span class="nav-link" onclick="App.navigate('home')">Now Showing</span>`;
    } else if (u.role === 'cashier') {
      links.innerHTML = `<span class="nav-link" onclick="App.navigate('cashier')">POS Terminal</span>`;
    } else {
      links.innerHTML = `<span class="nav-link" onclick="App.navigate('admin')">Dashboard</span>`;
    }
  },

  // ─── NAVIGATION ──────────────────────────────────────────

  navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById('page-' + page);
    if (target) { target.classList.remove('hidden'); window.scrollTo(0, 0); }
    if (page === 'home')    this._renderHome();
    if (page === 'cashier') this._renderCashier();
    if (page === 'admin')   this._renderAdmin();
  },

  goBack(fallback) {
    if (window.history.length > 1) window.history.back();
    else this.navigate(fallback || 'home');
  },

  // ─── CUSTOMER: HOME ──────────────────────────────────────

  _renderHome() {
    const movies = DB.getMovies().filter(m => m.isActive);
    const grid   = document.getElementById('movies-grid');
    if (!movies.length) {
      grid.innerHTML = `<div class="empty-state"><div class="icon">🎬</div><p>No movies currently showing</p></div>`;
      return;
    }
    grid.innerHTML = movies.map(m => `
      <div class="movie-card" onclick="App.showMovieDetail('${m.id}')">
        <div class="movie-poster-wrap">
          ${this.posterHTML(m)}
          <div class="poster-overlay"></div>
        </div>
        <div class="movie-card-body">
          <div class="movie-card-title">${m.title}</div>
          <div class="movie-card-meta">${m.duration} &nbsp;·&nbsp; ${m.rating}</div>
          <div class="movie-card-genre">${m.genre}</div>
          ${m.releaseDate ? `<div class="movie-card-release">📅 ${m.releaseDate}</div>` : ''}
        </div>
      </div>`).join('');
  },

  // ─── CUSTOMER: MOVIE DETAIL ──────────────────────────────

  showMovieDetail(movieId) {
    const movie = DB.getMovies().find(m => m.id === movieId);
    if (!movie) return;
    this.currentMovie = movie;

    const today   = new Date().toISOString().split('T')[0];
    const upcoming = DB.getSchedules().filter(s => s.movieId === movieId && s.date >= today);
    const byDate   = {};
    upcoming.forEach(s => { (byDate[s.date] = byDate[s.date] || []).push(s); });

    const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; })();
    const dateLabel = d => d === today ? 'Today' : d === tomorrow ? 'Tomorrow' : d;

    document.getElementById('movie-detail-content').innerHTML = `
      <div class="back-btn">
        <button class="btn btn-sm" onclick="App.navigate('home')">← Back</button>
      </div>
      <div style="display:grid;grid-template-columns:220px 1fr;gap:40px;margin-bottom:36px;align-items:start">
        <div style="width:220px;height:310px;border-radius:8px;overflow:hidden;border:1px solid var(--border);background:var(--surface2);flex-shrink:0">
          ${this.posterHTML(movie, '220px', '310px')}
        </div>
        <div>
          <div style="font-size:11px;letter-spacing:2px;color:var(--gold);text-transform:uppercase;margin-bottom:8px">${movie.genre}</div>
          <h1 style="font-family:'Cormorant Garamond',serif;font-size:50px;font-weight:300;line-height:1;margin-bottom:14px">${movie.title}</h1>
          <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:18px;align-items:center">
            <span class="badge badge-gold">${movie.rating}</span>
            <span style="font-size:13px;color:var(--text-dim)">⏱ ${movie.duration}</span>
            ${movie.releaseDate ? `<span style="font-size:13px;color:var(--gold-dark)">📅 ${movie.releaseDate}</span>` : ''}
          </div>
          <p style="font-size:14px;line-height:1.85;color:var(--text-dim);max-width:580px">${movie.description}</p>
        </div>
      </div>
      <div class="card">
        <div class="sidebar-title" style="margin-bottom:20px">Select a Showtime</div>
        ${Object.keys(byDate).length
          ? Object.keys(byDate).sort().map(date => `
              <div style="margin-bottom:24px">
                <div style="font-size:12px;font-weight:600;letter-spacing:1.5px;color:var(--gold);margin-bottom:12px;text-transform:uppercase">${dateLabel(date)}</div>
                <div class="schedules-grid">
                  ${byDate[date].map(s => `
                    <div class="schedule-slot" onclick="App.selectSchedule('${s.id}')">
                      <div style="font-weight:600">${s.time}</div>
                      <div class="slot-hall">Hall ${s.hallNumber}</div>
                    </div>`).join('')}
                </div>
              </div>`).join('')
          : `<p style="color:var(--text-dim);font-size:14px">No upcoming schedules available.</p>`}
      </div>`;
    this.navigate('movie-detail');
  },

  // ─── CUSTOMER: SEATS ─────────────────────────────────────

  selectSchedule(scheduleId) {
    this.currentSchedule = DB.getSchedules().find(s => s.id === scheduleId);
    this.selectedSeats   = [];
    this.navigate('seats');
    this._renderSeatPage();
  },

  _renderSeatPage() {
    if (!this.currentSchedule || !this.currentMovie) return;
    document.getElementById('seats-movie-title').textContent    = this.currentMovie.title;
    document.getElementById('seats-schedule-info').textContent  =
      `${this.currentSchedule.date}  ·  ${this.currentSchedule.time}  ·  Hall ${this.currentSchedule.hallNumber}`;
    this._buildSeatGrid('seat-grid', this.currentSchedule.id, this.selectedSeats, '_toggleSeat');
    this._updateSeatSidebar();
  },

  _buildSeatGrid(containerId, scheduleId, selected, toggleFn) {
    const seatMap = (DB.getSeats()[scheduleId]) || {};
    const rows    = ['A','B','C','D','E','F','G','H'];
    const container = document.getElementById(containerId);
    container.innerHTML = rows.map(row => `
      <div class="seat-row">
        <div class="seat-row-label">${row}</div>
        ${Array.from({length:10}, (_,i) => {
          const code = row+(i+1);
          const seat = seatMap[code];
          if (!seat) return '';
          const isSelected = selected.includes(code);
          const cls = isSelected
            ? (seat.type==='premium' ? 'premium-selected' : 'selected')
            : (seat.status==='occupied' ? 'occupied' : (seat.type==='premium' ? 'premium-available' : 'available'));
          const clickable = seat.status !== 'occupied';
          return `<div class="seat ${cls}"
            title="${code}${seat.type==='premium' ? ' ★ Premium' : ''}"
            ${clickable ? `onclick="App.${toggleFn}('${code}')"` : ''}></div>`;
        }).join('')}
      </div>`).join('');
  },

  _toggleSeat(code) {
    const map  = (DB.getSeats()[this.currentSchedule.id]) || {};
    const seat = map[code];
    if (!seat || seat.status === 'occupied') return;
    const idx = this.selectedSeats.indexOf(code);
    if (idx > -1) {
      this.selectedSeats.splice(idx, 1);
    } else {
      if (this.selectedSeats.length >= 8) { this.notify('Maximum 8 seats per booking', 'error'); return; }
      this.selectedSeats.push(code);
    }
    this._renderSeatPage();
  },

  _updateSeatSidebar() {
    const pricing = DB.getPricing();
    const seatMap = (DB.getSeats()[this.currentSchedule?.id]) || {};
    const summary = document.getElementById('seat-summary');
    const btn     = document.getElementById('proceed-btn');
    if (!this.selectedSeats.length) {
      summary.innerHTML = `<div style="color:var(--text-dim);font-size:13px;text-align:center;padding:20px 0">No seats selected yet</div>`;
      btn.disabled = true; return;
    }
    let total = 0;
    const rows = this.selectedSeats.map(code => {
      const seat  = seatMap[code];
      const price = seat?.type === 'premium' ? pricing.premium : pricing.standard;
      total += price;
      return `<div class="order-row">
        <span>${code} ${seat?.type==='premium' ? '<span class="badge badge-gold">★</span>' : ''}</span>
        <span>₱${price.toLocaleString()}</span>
      </div>`;
    }).join('');
    summary.innerHTML = rows + `
      <div class="order-total">
        <span class="order-total-label">Total</span>
        <span class="order-total-value">₱${total.toLocaleString()}</span>
      </div>`;
    btn.disabled = false;
  },

  proceedToPayment() {
    if (!this.selectedSeats.length) { this.notify('Please select at least one seat', 'error'); return; }
    this.navigate('payment');
    this._renderPaymentSummary();
    this.selectPayment('cash'); // default
  },

  // ─── CUSTOMER: PAYMENT ───────────────────────────────────

  selectPayment(method) {
    this.currentPaymentMethod = method;
    document.querySelectorAll('.pay-method').forEach(el =>
      el.classList.toggle('active', el.dataset.method === method));
    const fields = document.getElementById('payment-fields');
    if (method === 'cash') {
      fields.innerHTML = `<div style="padding:12px;background:var(--surface2);border-radius:4px;font-size:13px;color:var(--text-dim);border:1px solid var(--border)">💵 Pay at the counter upon arrival.</div>`;
    } else if (method === 'card') {
      fields.innerHTML = `
        <div style="display:grid;gap:10px;margin-top:12px">
          <input class="input" placeholder="Card Number  1234 5678 9012 3456">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <input class="input" placeholder="MM / YY">
            <input class="input" placeholder="CVV">
          </div>
        </div>`;
    } else if (method === 'gcash') {
      fields.innerHTML = `<div style="margin-top:10px"><input class="input" placeholder="GCash Number  09XX XXX XXXX"></div>`;
    } else if (method === 'maya') {
      fields.innerHTML = `<div style="margin-top:10px"><input class="input" placeholder="Maya Account Number"></div>`;
    }
  },

  _renderPaymentSummary() {
    const pricing = DB.getPricing();
    const seatMap = (DB.getSeats()[this.currentSchedule?.id]) || {};
    let subtotal  = 0;
    this.selectedSeats.forEach(code => {
      const seat = seatMap[code];
      subtotal += seat?.type === 'premium' ? pricing.premium : pricing.standard;
    });
    const fee   = pricing.serviceFee;
    const total = subtotal + fee;
    this._payTotal = total;
    document.getElementById('payment-summary').innerHTML = `
      <div class="order-row"><span style="color:var(--text-dim);font-size:12px">${this.currentMovie?.title}</span></div>
      <div class="order-row"><span style="color:var(--text-dim)">Seats: ${this.selectedSeats.join(', ')}</span></div>
      <div class="order-row"><span>Subtotal</span><span>₱${subtotal.toLocaleString()}</span></div>
      <div class="order-row"><span>Service Fee</span><span>₱${fee}</span></div>
      <div class="order-total">
        <span class="order-total-label">Total</span>
        <span class="order-total-value">₱${total.toLocaleString()}</span>
      </div>`;
  },

  confirmPayment() {
    const name  = document.getElementById('pay-name').value.trim();
    const email = document.getElementById('pay-email').value.trim();
    if (!name)  { this.notify('Please enter your name', 'error'); return; }
    if (!email) { this.notify('Please enter your email', 'error'); return; }

    const reserved = DB.reserveSeats(this.currentSchedule.id, this.selectedSeats);
    if (!reserved) {
      this.notify('Some seats are no longer available. Please reselect.', 'error');
      this.navigate('seats'); this._renderSeatPage(); return;
    }

    const booking = new Booking('B-'+Date.now(), this.currentUser?.id||'guest',
      this.currentSchedule.id, this.currentMovie.id, [...this.selectedSeats]);

    let payment;
    switch (this.currentPaymentMethod) {
      case 'card':  payment = new CardPayment ('P-'+Date.now(), this._payTotal); break;
      case 'gcash': payment = new GCashPayment('P-'+Date.now(), this._payTotal); break;
      case 'maya':  payment = new MayaPayment ('P-'+Date.now(), this._payTotal); break;
      default:      payment = new CashPayment ('P-'+Date.now(), this._payTotal);
    }
    payment.processPayment();
    booking.setPayment(payment);
    booking.confirm();

    const scheduleInfo = `${this.currentSchedule.date} · ${this.currentSchedule.time}`;
    const ticket = booking.generateTicket(this.currentMovie.title, scheduleInfo, name, this._payTotal);

    const txn = new Transaction('TXN-'+Date.now(), booking.id, this._payTotal,
      payment.method, name, this.currentMovie.title, [...this.selectedSeats], scheduleInfo);
    DB.addTransaction(txn);

    document.getElementById('ticket-display').innerHTML = ticket.getReceiptHTML();
    this.selectedSeats = [];
    this.navigate('confirmation');
    this.notify('Booking confirmed! Enjoy the show! 🎬', 'success');
  },

  // ─── CASHIER ─────────────────────────────────────────────

  _renderCashier() {
    this.cashierMovie         = null;
    this.cashierSchedule      = null;
    this.cashierSelectedSeats = [];
    this._cashierTotal        = 0;

    const sel    = document.getElementById('cashier-movie-select');
    const movies = DB.getMovies().filter(m => m.isActive);
    sel.innerHTML = '<option value="">— Select a movie —</option>' +
      movies.map(m => `<option value="${m.id}">${m.title}</option>`).join('');

    document.getElementById('cashier-schedule-section').style.display = 'none';
    document.getElementById('cashier-seats-section').style.display    = 'none';
    this._updateCashierSidebar();
  },

  cashierMovieChanged() {
    const mid = document.getElementById('cashier-movie-select').value;
    this.cashierSelectedSeats = [];
    this.cashierSchedule      = null;
    this.cashierMovie         = null;

    if (!mid) {
      document.getElementById('cashier-schedule-section').style.display = 'none';
      document.getElementById('cashier-seats-section').style.display    = 'none';
      this._updateCashierSidebar(); return;
    }

    this.cashierMovie = DB.getMovies().find(m => m.id === mid);
    const today       = new Date().toISOString().split('T')[0];
    const schedules   = DB.getSchedules().filter(s => s.movieId === mid && s.date >= today);

    document.getElementById('cashier-schedules').innerHTML = schedules.length
      ? schedules.map(s => `
          <div class="schedule-slot" data-sid="${s.id}" onclick="App.cashierSelectSchedule('${s.id}')">
            <div style="font-weight:600">${s.date} · ${s.time}</div>
            <div class="slot-hall">Hall ${s.hallNumber}</div>
          </div>`).join('')
      : `<div style="color:var(--text-dim);font-size:13px">No upcoming schedules for this movie.</div>`;

    document.getElementById('cashier-schedule-section').style.display = 'block';
    document.getElementById('cashier-seats-section').style.display    = 'none';
    this._updateCashierSidebar();
  },

  cashierSelectSchedule(sid) {
    this.cashierSchedule      = DB.getSchedules().find(s => s.id === sid);
    this.cashierSelectedSeats = [];
    document.querySelectorAll('#cashier-schedules .schedule-slot').forEach(el =>
      el.classList.toggle('active', el.dataset.sid === sid));
    document.getElementById('cashier-seats-section').style.display = 'block';
    this._buildSeatGrid('cashier-seat-grid', sid, this.cashierSelectedSeats, '_cashierToggleSeat');
    this._updateCashierSidebar();
  },

  _cashierToggleSeat(code) {
    const map  = (DB.getSeats()[this.cashierSchedule.id]) || {};
    const seat = map[code];
    if (!seat || seat.status === 'occupied') return;
    const idx = this.cashierSelectedSeats.indexOf(code);
    if (idx > -1) {
      this.cashierSelectedSeats.splice(idx, 1);
    } else {
      if (this.cashierSelectedSeats.length >= 10) { this.notify('Max 10 seats per transaction', 'error'); return; }
      this.cashierSelectedSeats.push(code);
    }
    this._buildSeatGrid('cashier-seat-grid', this.cashierSchedule.id, this.cashierSelectedSeats, '_cashierToggleSeat');
    this._updateCashierSidebar();
  },

  _updateCashierSidebar() {
    const el         = document.getElementById('cashier-order-summary');
    const paySection = document.getElementById('cashier-pay-section');

    if (!this.cashierSchedule || !this.cashierSelectedSeats.length) {
      el.innerHTML = `<div style="color:var(--text-dim);font-size:13px;text-align:center;padding:20px 0">Select a movie, schedule, and seats to begin.</div>`;
      paySection.classList.add('hidden'); return;
    }

    const pricing = DB.getPricing();
    const seatMap = (DB.getSeats()[this.cashierSchedule.id]) || {};
    let total     = 0;

    const rows = this.cashierSelectedSeats.map(code => {
      const seat  = seatMap[code];
      const price = seat?.type === 'premium' ? pricing.premium : pricing.standard;
      total += price;
      return `<div class="order-row"><span>${code}</span><span>₱${price.toLocaleString()}</span></div>`;
    }).join('');

    // FIX: use cashierMovie.title directly, no undefined prefix
    const movieTitle = this.cashierMovie ? this.cashierMovie.title : '';

    el.innerHTML = `
      <div style="font-size:12px;color:var(--text-dim);margin-bottom:12px;line-height:1.6">
        <strong style="color:var(--text)">${movieTitle}</strong><br>
        ${this.cashierSchedule.date} · ${this.cashierSchedule.time} · Hall ${this.cashierSchedule.hallNumber}
      </div>
      ${rows}
      <div class="order-total">
        <span class="order-total-label">Total</span>
        <span class="order-total-value">₱${total.toLocaleString()}</span>
      </div>`;
    this._cashierTotal = total;
    paySection.classList.remove('hidden');
  },

  cashierProcess() {
    if (!this.cashierSchedule || !this.cashierSelectedSeats.length) {
      this.notify('Please select seats first', 'error'); return;
    }
    const reserved = DB.reserveSeats(this.cashierSchedule.id, this.cashierSelectedSeats);
    if (!reserved) {
      this.notify('Some seats are already taken. Please reselect.', 'error');
      this.cashierSelectSchedule(this.cashierSchedule.id); return;
    }

    const method       = document.getElementById('cashier-pay-method').value;
    const customerName = document.getElementById('cashier-customer-name').value.trim() || 'Walk-in Customer';
    const scheduleInfo = `${this.cashierSchedule.date} · ${this.cashierSchedule.time}`;

    const booking = new Booking('B-'+Date.now(), 'cashier-pos',
      this.cashierSchedule.id, this.cashierMovie.id, [...this.cashierSelectedSeats]);
    booking.confirm();

    const ticket = booking.generateTicket(
      this.cashierMovie.title, scheduleInfo, customerName, this._cashierTotal);

    const txn = new Transaction('TXN-'+Date.now(), booking.id, this._cashierTotal,
      method, customerName, this.cashierMovie.title, [...this.cashierSelectedSeats], scheduleInfo);
    DB.addTransaction(txn);

    this.showModal(`
      <div class="modal-title">🎫 Ticket Issued</div>
      ${ticket.getReceiptHTML()}
      <div style="display:flex;gap:12px;margin-top:24px">
        <button class="btn btn-solid btn-full" onclick="App.closeModal();App._renderCashier()">New Transaction</button>
        <button class="btn" onclick="window.print()">Print</button>
      </div>`);
    this.notify('Transaction complete!', 'success');
  },

  // ─── ADMIN ───────────────────────────────────────────────

  _renderAdmin() {
    this._renderAdminStats();
    this.adminTab(this.currentAdminTab || 'movies');
  },

  _renderAdminStats() {
    const txns         = DB.getTransactions();
    const movies       = DB.getMovies().filter(m => m.isActive);
    const total        = txns.reduce((s,t) => s + t.amount, 0);
    const today        = new Date().toISOString().split('T')[0];
    const todayRevenue = txns.filter(t => t.timestamp.startsWith(today)).reduce((s,t) => s+t.amount, 0);
    document.getElementById('admin-stats').innerHTML = `
      <div class="stat-card"><div class="stat-value">${txns.length}</div><div class="stat-label">Total Transactions</div></div>
      <div class="stat-card"><div class="stat-value">₱${(total/1000).toFixed(1)}K</div><div class="stat-label">Total Revenue</div></div>
      <div class="stat-card"><div class="stat-value">₱${(todayRevenue/1000).toFixed(1)}K</div><div class="stat-label">Today's Revenue</div></div>
      <div class="stat-card"><div class="stat-value">${movies.length}</div><div class="stat-label">Active Movies</div></div>`;
  },

  adminTab(tab) {
    this.currentAdminTab = tab;
    document.querySelectorAll('.admin-tab').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === tab);
    });
    ['movies','schedules','pricing','transactions','reports'].forEach(t => {
      document.getElementById('admin-panel-'+t).classList.toggle('hidden', t !== tab);
    });
    if (tab === 'movies')       this._adminMovies();
    if (tab === 'schedules')    this._adminSchedules();
    if (tab === 'pricing')      this._adminPricing();
    if (tab === 'transactions') this._adminTransactions();
    if (tab === 'reports')      this._adminReports();
  },

  _adminMovies() {
    const movies = DB.getMovies();
    document.getElementById('admin-movies-list').innerHTML = `
      <div class="card table-wrap">
        <table class="data-table">
          <thead><tr><th>Poster</th><th>Title</th><th>Genre</th><th>Duration</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${movies.map(m => `
              <tr>
                <td>
                  <div class="movie-thumb">
                    ${m.poster
                      ? `<img src="${m.poster}" onerror="this.style.display='none'">`
                      : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:14px">🎬</div>'}
                  </div>
                </td>
                <td><strong>${m.title}</strong></td>
                <td style="color:var(--text-dim);font-size:12px">${m.genre}</td>
                <td>${m.duration}</td>
                <td><span class="badge badge-gold">${m.rating}</span></td>
                <td><span class="badge ${m.isActive ? 'badge-green' : 'badge-red'}">${m.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <div class="flex-gap">
                    <button class="btn btn-sm" onclick="App.showMovieModal('${m.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="App.deleteMovie('${m.id}')">Delete</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  },

  showMovieModal(movieId) {
    const movie = movieId ? DB.getMovies().find(m => m.id === movieId) : null;
    const esc   = v => (v||'').replace(/"/g,'&quot;');
    this.showModal(`
      <div class="modal-title">${movie ? 'Edit Movie' : 'Add Movie'}</div>
      <div class="form-group">
        <label class="label">Title</label>
        <input class="input" id="m-title" value="${esc(movie?.title)}">
      </div>
      <div class="form-group">
        <label class="label">Description</label>
        <textarea class="input" id="m-desc">${movie?.description||''}</textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="form-group">
          <label class="label">Duration</label>
          <input class="input" id="m-duration" value="${esc(movie?.duration)}" placeholder="2h 00m">
        </div>
        <div class="form-group">
          <label class="label">Rating</label>
          <select class="input" id="m-rating">
            ${['G','PG','PG-13','R','R-18'].map(r => `<option ${movie?.rating===r?'selected':''}>${r}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="label">Genre</label>
        <input class="input" id="m-genre" value="${esc(movie?.genre)}" placeholder="Action / Drama">
      </div>
      <div class="form-group">
        <label class="label">Release Date</label>
        <input class="input" id="m-release" value="${esc(movie?.releaseDate)}" placeholder="May 1, 2026">
      </div>
      <div class="form-group">
        <label class="label">Poster — file path or URL</label>
        <input class="input" id="m-poster" value="${esc(movie?.poster)}"
          placeholder="images/MovieTitle.jpg  or  https://...">
        <div id="m-poster-preview" style="margin-top:10px;${movie?.poster?'':'display:none'}">
          <div class="poster-preview-box">
            <img id="m-poster-img" src="${esc(movie?.poster)}" onerror="this.style.display='none'">
          </div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:6px">Preview</div>
        </div>
        <div style="font-size:11px;color:var(--text-dim);margin-top:6px;line-height:1.6">
          Use a local path like <code style="color:var(--gold)">images/Michael.jpg</code> or paste any image URL.<br>
          Leave blank to show the "Poster Coming Soon" placeholder.
        </div>
      </div>
      <div style="display:flex;gap:12px;margin-top:4px">
        <button class="btn btn-solid" onclick="App.saveMovie('${movieId||''}')">Save Movie</button>
        <button class="btn" onclick="App.closeModal()">Cancel</button>
      </div>`);

    // Live preview on input
    setTimeout(() => {
      const inp   = document.getElementById('m-poster');
      const prev  = document.getElementById('m-poster-preview');
      const img   = document.getElementById('m-poster-img');
      if (inp) inp.addEventListener('input', () => {
        const v = inp.value.trim();
        if (v) { prev.style.display='block'; img.src=v; img.style.display=''; }
        else   { prev.style.display='none'; }
      });
    }, 60);
  },

  saveMovie(movieId) {
    const title   = document.getElementById('m-title').value.trim();
    const desc    = document.getElementById('m-desc').value.trim();
    const duration= document.getElementById('m-duration').value.trim();
    const rating  = document.getElementById('m-rating').value;
    const genre   = document.getElementById('m-genre').value.trim();
    const release = document.getElementById('m-release').value.trim();
    const poster  = document.getElementById('m-poster').value.trim();
    if (!title) { this.notify('Title is required', 'error'); return; }
    if (movieId) {
      DB.updateMovie(movieId, { title, description:desc, duration, rating, genre, releaseDate:release, poster });
      this.notify('Movie updated!', 'success');
    } else {
      const m = new Movie('m'+Date.now(), title, desc, duration, genre, rating, poster, release);
      DB.addMovie(m);
      this.notify('Movie added!', 'success');
    }
    this.closeModal();
    this._adminMovies();
    this._renderAdminStats();
  },

  deleteMovie(id) {
    if (!confirm('Delete this movie? This cannot be undone.')) return;
    DB.deleteMovie(id);
    this.notify('Movie deleted.', 'success');
    this._adminMovies();
    this._renderAdminStats();
  },

  _adminSchedules() {
    const schedules = DB.getSchedules();
    const movies    = DB.getMovies();
    document.getElementById('admin-schedules-list').innerHTML = `
      <div class="card table-wrap">
        <table class="data-table">
          <thead><tr><th>Movie</th><th>Date</th><th>Time</th><th>Hall</th><th>Action</th></tr></thead>
          <tbody>
            ${schedules.map(s => {
              const movie = movies.find(m => m.id === s.movieId);
              return `<tr>
                <td><strong>${movie?.title || 'Unknown'}</strong></td>
                <td>${s.date}</td>
                <td>${s.time}</td>
                <td>Hall ${s.hallNumber}</td>
                <td><button class="btn btn-sm btn-danger" onclick="App.deleteSchedule('${s.id}')">Delete</button></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  },

  showScheduleModal() {
    const movies = DB.getMovies().filter(m => m.isActive);
    const today  = new Date().toISOString().split('T')[0];
    this.showModal(`
      <div class="modal-title">Add Schedule</div>
      <div class="form-group">
        <label class="label">Movie</label>
        <select class="input" id="s-movie">
          ${movies.map(m => `<option value="${m.id}">${m.title}</option>`).join('')}
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="form-group">
          <label class="label">Date</label>
          <input type="date" class="input" id="s-date" value="${today}" min="${today}">
        </div>
        <div class="form-group">
          <label class="label">Hall</label>
          <select class="input" id="s-hall">
            <option value="1">Hall 1</option>
            <option value="2">Hall 2</option>
            <option value="3">Hall 3</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="label">Time</label>
        <select class="input" id="s-time">
          <option>10:00 AM</option><option>1:30 PM</option>
          <option>4:30 PM</option><option>7:30 PM</option><option>10:00 PM</option>
        </select>
      </div>
      <div style="display:flex;gap:12px">
        <button class="btn btn-solid" onclick="App.saveSchedule()">Add Schedule</button>
        <button class="btn" onclick="App.closeModal()">Cancel</button>
      </div>`);
  },

  saveSchedule() {
    const movieId = document.getElementById('s-movie').value;
    const date    = document.getElementById('s-date').value;
    const time    = document.getElementById('s-time').value;
    const hall    = document.getElementById('s-hall').value;
    if (!movieId || !date) { this.notify('Please fill all fields', 'error'); return; }
    DB.addSchedule(new Schedule('s'+Date.now(), movieId, date, time, parseInt(hall)));
    this.notify('Schedule added!', 'success');
    this.closeModal();
    this._adminSchedules();
  },

  deleteSchedule(id) {
    if (!confirm('Delete this schedule?')) return;
    DB.deleteSchedule(id);
    this.notify('Schedule deleted.', 'success');
    this._adminSchedules();
  },

  _adminPricing() {
    const p = DB.getPricing();
    document.getElementById('admin-pricing-panel').innerHTML = `
      <div class="card" style="max-width:480px">
        <div class="sidebar-title">Ticket Prices</div>
        <div class="form-group">
          <label class="label">Standard Seat (₱)</label>
          <input type="number" class="input" id="p-standard" value="${p.standard}">
        </div>
        <div class="form-group">
          <label class="label">Premium Seat ★ — Rows A & B (₱)</label>
          <input type="number" class="input" id="p-premium" value="${p.premium}">
        </div>
        <div class="form-group">
          <label class="label">Service Fee (₱)</label>
          <input type="number" class="input" id="p-fee" value="${p.serviceFee}">
        </div>
        <button class="btn btn-solid" onclick="App.savePricing()">Save Pricing</button>
      </div>`;
  },

  savePricing() {
    const std  = parseInt(document.getElementById('p-standard').value);
    const prem = parseInt(document.getElementById('p-premium').value);
    const fee  = parseInt(document.getElementById('p-fee').value);
    if ([std,prem,fee].some(isNaN)) { this.notify('Invalid values', 'error'); return; }
    DB.savePricing({ standard:std, premium:prem, serviceFee:fee });
    this.notify('Pricing saved!', 'success');
  },

  _adminTransactions() {
    const txns = DB.getTransactions();
    const el   = document.getElementById('admin-transactions-list');
    if (!txns.length) {
      el.innerHTML = `<div class="empty-state"><div class="icon">🧾</div><p>No transactions yet</p></div>`; return;
    }
    el.innerHTML = `
      <div class="card table-wrap">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Movie</th><th>Seats</th><th>Customer</th><th>Amount</th><th>Method</th><th>Date & Time</th></tr></thead>
          <tbody>
            ${txns.map(t => `
              <tr>
                <td style="font-size:11px;color:var(--gold)">${t.id}</td>
                <td><strong>${t.movieTitle}</strong></td>
                <td style="font-size:12px">${Array.isArray(t.seats)?t.seats.join(', '):t.seats}</td>
                <td>${t.customerName}</td>
                <td><strong>₱${t.amount.toLocaleString()}</strong></td>
                <td><span class="badge badge-gold">${t.paymentMethod}</span></td>
                <td style="color:var(--text-dim);font-size:12px">${new Date(t.timestamp).toLocaleString()}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  },

  _adminReports() {
    const txns  = DB.getTransactions();
    const total = txns.reduce((s,t) => s+t.amount, 0);
    const today = new Date().toISOString().split('T')[0];
    const todayTotal = txns.filter(t => t.timestamp.startsWith(today)).reduce((s,t) => s+t.amount, 0);

    const byMovie  = {};
    const byMethod = {};
    txns.forEach(t => {
      byMovie[t.movieTitle]     = (byMovie[t.movieTitle]||0)  + t.amount;
      byMethod[t.paymentMethod] = (byMethod[t.paymentMethod]||0) + t.amount;
    });

    const barRows = (obj) => Object.keys(obj).sort((a,b) => obj[b]-obj[a]).map(k => {
      const pct = total ? Math.round(obj[k]/total*100) : 0;
      return `<div class="report-bar-row">
        <div class="report-bar-header">
          <span>${k}</span><span style="color:var(--gold)">₱${obj[k].toLocaleString()}</span>
        </div>
        <div class="report-bar-track"><div class="report-bar-fill" style="width:${pct}%"></div></div>
      </div>`;
    }).join('');

    document.getElementById('admin-reports-panel').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px">
        <div class="card">
          <div class="sidebar-title">Revenue by Movie</div>
          ${Object.keys(byMovie).length ? barRows(byMovie) : '<p style="color:var(--text-dim);font-size:13px">No data yet</p>'}
        </div>
        <div class="card">
          <div class="sidebar-title">By Payment Method</div>
          ${Object.keys(byMethod).length ? barRows(byMethod) : '<p style="color:var(--text-dim);font-size:13px">No data yet</p>'}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
        <div class="stat-card"><div class="stat-value">₱${total.toLocaleString()}</div><div class="stat-label">Total Revenue</div></div>
        <div class="stat-card"><div class="stat-value">₱${todayTotal.toLocaleString()}</div><div class="stat-label">Today's Revenue</div></div>
        <div class="stat-card"><div class="stat-value">₱${txns.length ? Math.round(total/txns.length).toLocaleString() : 0}</div><div class="stat-label">Avg. Transaction</div></div>
      </div>`;
  },

  // ─── RESET DATA (admin utility) ──────────────────────────
  resetData() {
    if (!confirm('This will wipe ALL data (movies, schedules, transactions) and reseed defaults. Continue?')) return;
    DB.hardReset();
    this.notify('Data reset successfully. Reloading...', 'success');
    setTimeout(() => location.reload(), 1200);
  },
};

// ============================================================
// ===== BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-username').focus();
  // Set default payment display
  App.selectPayment('cash');
});
