import React from 'react';
import { isCoaSpell } from '../../data/coaSpells';

interface MacroCodeHighlighterProps {
  code: string;
}

/**
 * Rich syntax highlighter component for WoW 3.3.5a macro code with Ascension CoA spell detection
 */
export const MacroCodeHighlighter: React.FC<MacroCodeHighlighterProps> = ({ code }) => {
  if (!code) {
    return (
      <span className="text-gray-600 italic">
        -- La macro generada aparecerá aquí cuando agregues bloques...
      </span>
    );
  }

  const lines = code.split('\n');

  const highlightSpellText = (text: string, keyPrefix: string): React.ReactNode => {
    // Preserve leading and trailing whitespace
    const leadingSpaceMatch = text.match(/^(\s+)/);
    const trailingSpaceMatch = text.match(/(\s+)$/);
    const leadingSpace = leadingSpaceMatch ? leadingSpaceMatch[1] : '';
    const trailingSpace = trailingSpaceMatch ? trailingSpaceMatch[1] : '';
    const trimmed = text.trim();

    if (!trimmed) {
      return <span key={keyPrefix} className="text-gray-100 font-medium">{text}</span>;
    }

    // Check if whole text is a CoA spell
    if (isCoaSpell(trimmed)) {
      return (
        <React.Fragment key={keyPrefix}>
          {leadingSpace && <span>{leadingSpace}</span>}
          <span className="text-amber-200 font-bold inline-flex items-center gap-1">
            <span>{trimmed}</span>
            <span
              className="text-[9px] px-1 py-0.2 rounded bg-amber-500/25 text-amber-300 border border-amber-500/50 font-sans font-bold select-none cursor-help ml-1"
              title="Habilidad reconocida de Project Ascension (Conquest of Azeroth)"
            >
              CoA
            </span>
          </span>
          {trailingSpace && <span>{trailingSpace}</span>}
        </React.Fragment>
      );
    }

    // If it's a comma-separated list (e.g. in castsequence), check each element
    if (trimmed.includes(',')) {
      const subparts = text.split(',');
      return (
        <React.Fragment key={keyPrefix}>
          {subparts.map((sub, sIdx) => {
            const subLeadMatch = sub.match(/^(\s+)/);
            const subTrailMatch = sub.match(/(\s+)$/);
            const subLead = subLeadMatch ? subLeadMatch[1] : '';
            const subTrail = subTrailMatch ? subTrailMatch[1] : '';
            const cleanSub = sub.trim();
            const isCoa = isCoaSpell(cleanSub);

            return (
              <React.Fragment key={`${keyPrefix}_${sIdx}`}>
                {subLead && <span>{subLead}</span>}
                {isCoa ? (
                  <span className="text-amber-200 font-bold inline-flex items-center gap-1">
                    <span>{cleanSub}</span>
                    <span
                      className="text-[9px] px-1 py-0.2 rounded bg-amber-500/25 text-amber-300 border border-amber-500/50 font-sans font-bold select-none cursor-help ml-1"
                      title="Habilidad de Project Ascension (Conquest of Azeroth)"
                    >
                      CoA
                    </span>
                  </span>
                ) : (
                  <span className="text-gray-100 font-medium">{cleanSub}</span>
                )}
                {subTrail && <span>{subTrail}</span>}
                {sIdx < subparts.length - 1 && <span className="text-gray-500">,</span>}
              </React.Fragment>
            );
          })}
        </React.Fragment>
      );
    }

    return (
      <span key={keyPrefix} className="text-gray-100 font-medium">
        {text}
      </span>
    );
  };

  const highlightBracketContent = (content: string) => {
    const parts = content.split(',');
    return parts.map((part, pIdx) => {
      const trimmed = part.trim();
      let color = 'text-sky-300';

      if (trimmed.startsWith('@') || trimmed.startsWith('target=')) {
        color = 'text-purple-300 font-bold'; // Targets
      } else if (trimmed.startsWith('mod:') || trimmed === 'mod' || trimmed === 'nomod') {
        color = 'text-lime-300 font-semibold'; // Modifiers
      } else if (trimmed === 'harm') {
        color = 'text-rose-400 font-bold'; // Hostile
      } else if (trimmed === 'help') {
        color = 'text-emerald-400 font-bold'; // Friendly
      } else if (trimmed === 'nodead') {
        color = 'text-emerald-300 font-semibold'; // Alive
      } else if (trimmed === 'dead') {
        color = 'text-purple-300 font-semibold'; // Dead
      } else if (trimmed === 'exists' || trimmed === 'noexists') {
        color = 'text-cyan-300 font-semibold'; // Exists
      } else if (trimmed === 'combat' || trimmed === 'nocombat') {
        color = 'text-amber-300 font-semibold'; // Combat
      } else if (trimmed === 'stealth' || trimmed === 'nostealth') {
        color = 'text-indigo-300 font-semibold'; // Stealth
      } else if (trimmed.startsWith('form:') || trimmed.startsWith('noform:') || trimmed.startsWith('stance:')) {
        color = 'text-yellow-300 font-semibold'; // Stance
      } else if (trimmed.startsWith('equipped:') || trimmed.startsWith('noequipped:')) {
        color = 'text-orange-300 font-semibold'; // Equipment
      } else if (trimmed.startsWith('btn:') || trimmed.startsWith('button:')) {
        color = 'text-blue-300 font-semibold'; // Button
      }

      return (
        <React.Fragment key={pIdx}>
          <span className={color}>{part}</span>
          {pIdx < parts.length - 1 && <span className="text-gray-500">,</span>}
        </React.Fragment>
      );
    });
  };

  const highlightLine = (line: string, lineIndex: number) => {
    const trimmed = line.trim();

    // 1. Comments
    if (trimmed.startsWith('--') || trimmed.startsWith('//')) {
      return (
        <span key={lineIndex} className="text-gray-500 italic block font-mono">
          {line}
        </span>
      );
    }

    // 2. Directives (#showtooltip, #show)
    if (trimmed.startsWith('#showtooltip') || trimmed.startsWith('#show')) {
      const match = line.match(/^(#showtooltip|#show)(\s+.*)?$/);
      if (match) {
        const spellPart = match[2] || '';
        return (
          <span key={lineIndex} className="block font-mono leading-relaxed">
            <span className="text-amber-400 font-bold">{match[1]}</span>
            {spellPart && highlightSpellText(spellPart, `st_${lineIndex}`)}
          </span>
        );
      }
    }

    // 3. Lua Scripts (/run, /script)
    if (trimmed.startsWith('/run') || trimmed.startsWith('/script')) {
      const match = line.match(/^(\/(?:run|script))(\s+.*)?$/);
      if (match) {
        return (
          <span key={lineIndex} className="block font-mono leading-relaxed">
            <span className="text-pink-400 font-bold">{match[1]}</span>
            {match[2] && <span className="text-pink-300/90">{match[2]}</span>}
          </span>
        );
      }
    }

    // 4. Standard Commands with Brackets and Arguments
    const commandMatch = line.match(/^(\/[a-zA-Z0-9]+)(.*)$/);
    if (!commandMatch) {
      return (
        <span key={lineIndex} className="text-gray-300 block font-mono leading-relaxed">
          {line}
        </span>
      );
    }

    const command = commandMatch[1];
    const rest = commandMatch[2] || '';

    // Color code command
    let cmdColor = 'text-sky-400 font-bold';
    if (command === '/use' || command === '/cast' || command === '/castsequence') {
      cmdColor = 'text-sky-400 font-bold';
    } else if (command === '/cancelaura' || command === '/cancelform' || command === '/stopcasting') {
      cmdColor = 'text-rose-400 font-bold';
    } else if (command === '/tar' || command === '/target' || command === '/clear' || command === '/cleartarget' || command === '/focus') {
      cmdColor = 'text-teal-400 font-bold';
    } else if (command === '/petattack' || command === '/petfollow' || command === '/startattack') {
      cmdColor = 'text-lime-400 font-bold';
    }

    // Parse brackets inside rest
    const tokens: React.ReactNode[] = [];
    let currentPos = 0;
    const bracketRegex = /\[(.*?)\]/g;
    let match: RegExpExecArray | null;

    while ((match = bracketRegex.exec(rest)) !== null) {
      const textBefore = rest.slice(currentPos, match.index);
      if (textBefore) {
        tokens.push(
          <span key={`txt_${currentPos}`} className="text-gray-300 whitespace-pre">
            {textBefore}
          </span>
        );
      }

      // Bracket
      const bracketContent = match[1];
      tokens.push(
        <span key={`br_${match.index}`} className="font-mono">
          <span className="text-teal-400 font-bold">[</span>
          {highlightBracketContent(bracketContent)}
          <span className="text-teal-400 font-bold">]</span>
        </span>
      );

      currentPos = match.index + match[0].length;
    }

    const remainingText = rest.slice(currentPos);
    if (remainingText) {
      // Highlight arguments (Slot IDs 13/14/10 or reset=...)
      if (/^\s*(13|14|10|6|15|1|16|17|18)\b/.test(remainingText)) {
        tokens.push(
          <span key={`slot_${currentPos}`} className="text-amber-300 font-bold whitespace-pre">
            {remainingText}
          </span>
        );
      } else if (remainingText.includes('reset=')) {
        const parts = remainingText.split(/(reset=[^\s]+)/);
        tokens.push(
          <React.Fragment key={`seq_${currentPos}`}>
            {parts.map((p, pIdx) => {
              if (p.startsWith('reset=')) {
                return (
                  <span key={pIdx} className="text-amber-400 font-bold">
                    {p}
                  </span>
                );
              }
              return highlightSpellText(p, `sp_${currentPos}_${pIdx}`);
            })}
          </React.Fragment>
        );
      } else {
        tokens.push(highlightSpellText(remainingText, `rem_${currentPos}`));
      }
    }

    return (
      <span key={lineIndex} className="block font-mono leading-relaxed whitespace-pre">
        <span className={cmdColor}>{command}</span>
        {tokens}
      </span>
    );
  };

  return (
    <div className="space-y-0.5 select-all">
      {lines.map((line, idx) => highlightLine(line, idx))}
    </div>
  );
};
