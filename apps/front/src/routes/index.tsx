import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

type Resource = {
  id: string
  title: string
  description: string
  href: string
  category: string
  tags?: string[]
}

function ResourceCard({ r }: { r: Resource }) {
  return (
    <article className="resource-card" aria-labelledby={`res-${r.id}`}>
      <h3 id={`res-${r.id}`}>{r.title}</h3>
      <p>{r.description}</p>
      <p className="meta">
        <small>{r.category}</small>
        {r.tags && (
          <span aria-hidden="true" className="tags">
            {r.tags.map((t) => ` • ${t}`)}
          </span>
        )}
      </p>
      <p>
        <a href={r.href} target="_blank" rel="noreferrer">
          Accéder
        </a>
      </p>
    </article>
  )
}

export default function HomePage() {
  const [q, setQ] = useState('')
  const [lang, setLang] = useState('fr')

  const resources: Resource[] = [
    {
      id: 'impots',
      title: 'Impôts et déclarations',
      description: "Toutes les démarches fiscales : déclaration, paiement, aides.",
      href: 'https://www.impots.gouv.fr',
      category: 'Fiscalité',
      tags: ['déclaration', 'paiement'],
    },
    {
      id: 'sante',
      title: 'Santé et services médicaux',
      description: 'Trouver un médecin, prise de rendez-vous, informations sanitaires.',
      href: 'https://www.sante.fr',
      category: 'Santé',
      tags: ['médecin', 'urgences'],
    },
    {
      id: 'emploi',
      title: "Emploi et formation",
      description: "Offres, accompagnement, formation professionnelle et aides.",
      href: 'https://www.pole-emploi.fr',
      category: "Travail",
      tags: ['formation', 'offres'],
    },
    {
      id: 'cni',
      title: "Carte d'identité / Passeport",
      description: "Démarches pour obtenir ou renouveler vos titres d'identité.",
      href: 'https://www.service-public.fr',
      category: 'Documents',
      tags: ['identité'],
    },
    {
      id: 'logement',
      title: 'Logement et aides au logement',
      description: 'Informations sur les aides, démarches et droits locataires.',
      href: 'https://www.anah.fr',
      category: 'Logement',
      tags: ['aide', 'alloc'],
    },
  ]

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return resources
    return resources.filter(
      (r) =>
        r.title.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term) ||
        (r.tags || []).some((t) => t.toLowerCase().includes(term))
    )
  }, [q])

  return (
    <div className="gov-home" lang={lang}>
      <header className="banner" role="banner">
        <div className="brand">
          <strong>République — Portail des services</strong>
          <small>Accès simple et centralisé à l'information publique</small>
        </div>
        <div className="controls">
          <label htmlFor="lang" className="visually-hidden">
            Langue
          </label>
          <select
            id="lang"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Choisir la langue"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>
      </header>

      <main>
        <section aria-labelledby="search-title" className="search-section">
          <h1 id="search-title">Trouver un service ou une information</h1>
          <p className="lead">
            Recherchez rapidement des démarches, aides, services publics et
            contacts utiles.
          </p>

          <label htmlFor="search" className="visually-hidden">
            Recherche
          </label>
          <input
            id="search"
            type="search"
            placeholder="Ex. impôts, médecin, passeport..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Rechercher dans les ressources"
            className="search-input"
          />
        </section>

        <section aria-labelledby="quick-actions" className="quick-actions">
          <h2 id="quick-actions">Accès rapide</h2>
          <ul className="actions-list">
            <li>
              <a href="/declarations" role="button">
                Déclarer / payer
              </a>
            </li>
            <li>
              <a href="/sante" role="button">
                Trouver un professionnel de santé
              </a>
            </li>
            <li>
              <a href="/urgence" role="button">
                Urgences et numéros utiles
              </a>
            </li>
            <li>
              <a href="/aides" role="button">
                Aides et prestations
              </a>
            </li>
          </ul>
        </section>

        <section aria-labelledby="resources" className="resources">
          <h2 id="resources">Ressources</h2>
          {filtered.length === 0 ? (
            <p>Aucun résultat — essayez un autre mot-clé.</p>
          ) : (
            <div className="grid">
              {filtered.map((r) => (
                <ResourceCard key={r.id} r={r} />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="contact" className="contact">
          <h2 id="contact">Contact & aide</h2>
          <p>
            Besoin d'aide pour une démarche ? Contactez le support public au
            <a href="tel:3010"> 3010</a> (numéro fictif) ou utilisez le chat en
            ligne.
          </p>
        </section>
      </main>

      <footer className="site-footer" role="contentinfo">
        <p>© République — Informations publiques centralisées</p>
        <p>
          <a href="/accessibilite">Accessibilité</a> ·{' '}
          <a href="/mentions">Mentions légales</a>
        </p>
      </footer>
    </div>
  )
}