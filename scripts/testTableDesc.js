async function test() {
  const ids = [500060, 500061, 501344, 500000, 500002, 805819];
  for (const id of ids) {
    const res = await fetch(`https://db.ascension.gg/?spell=${id}&power`);
    const text = await res.text();
    const jsonMatch = text.match(/\$WowheadPower\.registerSpell\(\d+,\s*\d+,\s*(\{[\s\S]*?\})\);/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1]);
      const html = data.tooltip_enus || '';
      const tableMatches = html.match(/<table>[\s\S]*?<\/table>/gi);
      let desc = '';
      if (tableMatches && tableMatches.length >= 2) {
        desc = tableMatches[tableMatches.length - 1];
      } else {
        desc = html;
      }
      desc = desc
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n+/g, '\n')
        .trim();
      console.log(`\n=== ${id}: ${data.name_enus} ===`);
      console.log('Clean Description:\n', desc);
    }
  }
}
test().catch(console.error);
