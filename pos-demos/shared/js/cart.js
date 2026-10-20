function createCart() {
  const map = new Map();
  return {
    add(item) { const l = map.get(item.key); l ? l.qty++ : map.set(item.key, {...item, qty: 1}); },
    change(key, d) { const l = map.get(key); if (!l) return; l.qty += d; if (l.qty <= 0) map.delete(key); },
    clear() { map.clear(); },
    lines() { return [...map.values()]; },
    count() { return this.lines().reduce((n, l) => n + l.qty, 0); },
    total() { return this.lines().reduce((s, l) => s + l.price * l.qty, 0); }
  };
}
