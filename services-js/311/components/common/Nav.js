// @flow

import React from 'react';

import Link from 'next/link';

export type Props = {|
  activeSection: 'report' | 'services' | 'lookup' | 'faq',
|}

function renderNavItem({ href, as, title }, active) {
  return (
    <li className="nv-s-l-i">
      <Link href={href} as={as}>
        <a className={`nv-s-l-a ${active ? 'nv-s-l-a--active' : ''}`}>
          {title}
        </a>
      </Link>
    </li>
  );
}

export default function Nav({ activeSection }: Props) {
  let key = null;

  if (typeof window !== 'undefined') {
    // we use the current location as a key to force a complete re-render
    // on location change, which resets the checkbox to unchecked, closing
    // the dropdown
    key = window.location.href;
  }

  return (
    <nav className="nv-s nv-s--y nv-s--sticky" key={key}>
      <input type="checkbox" id="nv-s-tr" className="nv-s-tr" aria-hidden />

      <ul className="nv-s-l">
        <li className="nv-s-l-i">
          <label htmlFor="nv-s-tr" className="nv-s-l-b" type="button">Navigation</label>
        </li>

        { renderNavItem({ href: '/report', as: '/', title: 'Report a problem' }, activeSection === 'report')}
        { renderNavItem({ href: '/services', as: null, title: 'See all services' }, activeSection === 'services')}
        { renderNavItem({ href: '/lookup', as: null, title: 'Case look up' }, activeSection === 'lookup')}
        { renderNavItem({ href: '/faq', as: null, title: 'FAQ' }, activeSection === 'faq')}
      </ul>
    </nav>
  );
}
