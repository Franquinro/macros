async function test() {
  const ids = [500002, 500009, 500059, 500913, 500924];
  for (const id of ids) {
    const res = await fetch(`https://db.ascension.gg/?spell=${id}&power`);
    const text = await res.text();
    const jsonMatch = text.match(/\$WowheadPower\.registerSpell\(\d+,\s*\d+,\s*(\{[\s\S]*?\})\);/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1]);
      console.log(`\n=== Spell ${id}: ${data.name_enus} (Icon: ${data.icon}) ===`);
      console.log('Tooltip HTML:\n', data.tooltip_enus);
    }
  }
}
test().catch(console.error);
