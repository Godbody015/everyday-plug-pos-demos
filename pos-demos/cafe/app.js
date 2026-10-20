(() => {
  const M = window.MENU, cart = createCart(), $ = s => document.querySelector(s);
  let cat = M.categories[0], size = M.sizes[1], milk = M.milks[0], redeem = false;
  const data = () => Store.get('cafe', {sales: [], stamps: 0});
  const day = () => new Date().toISOString().slice(0, 10);
  const cheapestDrink = () => Math.min(...cart.lines().filter(l => l.drink).map(l => l.price), Infinity);

  function draw() {
    $('#cats').innerHTML = M.categories.map(c => `<button class="tab ${c === cat ? 'on' : ''}" data-cat="${c}">${c}</button>`).join('');
    const hasDrinks = M.items.some(i => i.cat === cat && i.drink);
    $('#opts').hidden = !hasDrinks;
    $('#opts').innerHTML = `<small>Size</small>` + M.sizes.map((s, i) => `<button class="opt ${s === size ? 'on' : ''}" data-size="${i}">${s.n}</button>`).join('') +
      `<small>Milk</small>` + M.milks.map((m, i) => `<button class="opt ${m === milk ? 'on' : ''}" data-milk="${i}">${m.n}</button>`).join('');
    $('#grid').innerHTML = M.items.filter(i => i.cat === cat).map(i =>
      `<button class="item" data-id="${i.id}"><b>${i.name}</b><span>${fmt(i.drink ? i.price + size.add + milk.add : i.price)}</span></button>`).join('');

    const lines = cart.lines();
    $('#lines').innerHTML = lines.length ? lines.map(l => `<li><div>${l.name}${l.opt ? `<em>${l.opt}</em>` : ''}</div>
      <div class="qty"><button data-k="${l.key}" data-d="-1" aria-label="Remove one">−</button>${l.qty}<button data-k="${l.key}" data-d="1" aria-label="Add one">+</button></div>
      <b>${fmt(l.price * l.qty)}</b></li>`).join('') : `<li class="empty">Tap an item to start an order.</li>`;

    if (!cart.lines().some(l => l.drink)) redeem = false;
    const d = redeem ? cheapestDrink() : 0, total = Math.max(0, cart.total() - d);
    $('#totals').innerHTML = (d ? `<div class="row mute"><span>Free drink</span><span>−${fmt(d)}</span></div>` : '') +
      `<div class="row mute"><span>Includes VAT (15%)</span><span>${fmt(vatPortion(total))}</span></div><div class="row big"><span>Total</span><span>${fmt(total)}</span></div>`;
    $('#pay').disabled = !lines.length; $('#clear').disabled = !lines.length;

    const st = data().stamps, full = Math.min(st, 8);
    $('#loyalty').innerHTML = 'Loyalty ' + Array.from({length: 8}, (_, i) => `<span class="dot ${i < full ? 'f' : ''}"></span>`).join('') +
      (st >= 8 && cart.lines().some(l => l.drink) && !redeem ? ` <button class="btn" id="redeem">Redeem free drink</button>` : redeem ? ' Free drink applied' : '');
    const todays = data().sales.filter(s => s.d === day());
    $('#today').textContent = `Today: ${fmt(todays.reduce((a, s) => a + s.total, 0))} · ${todays.length} sales`;
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.cat) cat = t.dataset.cat;
    else if (t.dataset.size) size = M.sizes[t.dataset.size];
    else if (t.dataset.milk) milk = M.milks[t.dataset.milk];
    else if (t.dataset.id) {
      const i = M.items.find(x => x.id === t.dataset.id);
      i.drink ? cart.add({key: `${i.id}|${size.n}|${milk.n}`, name: i.name, opt: `${size.n}, ${milk.n}`, price: i.price + size.add + milk.add, drink: true})
              : cart.add({key: i.id, name: i.name, price: i.price});
    } else if (t.dataset.k) cart.change(t.dataset.k, +t.dataset.d);
    else if (t.id === 'redeem') redeem = true;
    else if (t.id === 'clear') { cart.clear(); redeem = false; }
    else if (t.id === 'reset') { if (confirm('Clear all demo sales and stamps?')) Store.set('cafe', {sales: [], stamps: 0}); }
    else if (t.id === 'pay') return charge();
    else if (t.id === 'close') return $('#receipt').close();
    draw();
  });

  function charge() {
    const lines = cart.lines(), d = redeem ? cheapestDrink() : 0, total = Math.max(0, cart.total() - d);
    const drinks = lines.filter(l => l.drink).reduce((n, l) => n + l.qty, 0), db = data();
    db.sales.push({t: Date.now(), d: day(), total});
    db.stamps = Math.max(0, db.stamps - (redeem ? 8 : 0)) + drinks;
    Store.set('cafe', db);
    $('#receipt').innerHTML = `<h2>Paid ${fmt(total)}</h2>` + lines.map(l => `<div class="row"><span>${l.qty} × ${l.name}</span><span>${fmt(l.price * l.qty)}</span></div>`).join('') +
      (d ? `<div class="row mute"><span>Free drink</span><span>−${fmt(d)}</span></div>` : '') +
      `<div class="row mute"><span>Includes VAT</span><span>${fmt(vatPortion(total))}</span></div><p>Thank you. Order #${db.sales.length}</p><button id="close" class="btn primary">New order</button>`;
    cart.clear(); redeem = false; $('#receipt').showModal(); draw();
  }
  draw();
})();
