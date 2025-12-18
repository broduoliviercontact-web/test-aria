import React from "react";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="home-footer" role="contentinfo">
      <div className="home-footer__inner">
        <div className="home-footer__left">
       <a className="home-footer__brandLink" href="mailto:pliskain@gmail.com">
  Made by Pliskain
</a>
          <span className="home-footer__sep">·</span>
          <span className="home-footer__year">© {year}</span>
        </div>

        <nav className="home-footer__links" aria-label="Crédits">
          <a
            className="home-footer__link"
            href="https://www.fibretigre.com/"
            target="_blank"
            rel="noreferrer"
          >
            Aria un jeu de rôle créer par Fibre Tigre
          </a>

          <span className="home-footer__dot" aria-hidden="true">•</span>

          <a
            className="home-footer__link"
            href="https://elder-craft.com/"
            target="_blank"
            rel="noreferrer"
          >
           Éditée par Elder-Craft
          </a>
        </nav>
      </div>
    </footer>
  );
}
