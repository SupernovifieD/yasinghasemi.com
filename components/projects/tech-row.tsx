import styles from "@/components/projects/tech-row.module.css";
import { getTech, type TechId } from "@/lib/tech";

/**
 * A quiet row of the technologies a project uses: a small logo in a color
 * that reads on the black page, then its name. Entries without a logo are
 * text only. It uses div list roles, not ul/li, so the reading layout's prose
 * list styles do not apply to it.
 */
export function TechRow({ tech }: { tech: readonly TechId[] }) {
  return (
    <div className={styles.row} role="list" aria-label="Technologies">
      {tech.map((id) => {
        const { label, icon, color } = getTech(id);

        return (
          <div key={id} className={styles.item} role="listitem">
            {icon ? (
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
                style={color ? { color } : undefined}
              >
                <path d={icon} />
              </svg>
            ) : null}
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
