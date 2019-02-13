import React from 'react';
import { css } from 'emotion';
import { OPTIMISTIC_BLUE_LIGHT, SANS } from '@cityofboston/react-fleet';

const FOOTER_LINK_STYLE = css({
  color: OPTIMISTIC_BLUE_LIGHT,
  fontFamily: SANS,
  textTransform: 'uppercase',
});

const FOOTER_LEGAL_STYLE = css({
  color: 'white',
  marginTop: '0.25rem',
  fontSize: '90%',
});

export default function AccessBostonFooter() {
  return (
    <footer className="ft">
      <div className="ft-c" style={{ paddingTop: 0 }}>
        <a
          href="https://www.boston.gov/access-boston-portal-help"
          target="_blank"
          className={FOOTER_LINK_STYLE}
        >
          Help
        </a>

        <div className={FOOTER_LEGAL_STYLE}>
          The Access Boston Portal, and the systems, data and other resources
          that require Access Boston authentication for access are only to be
          used for legitimate City of Boston purposes. Use may be monitored, and
          unautorized access or improper use of the resources may be subject to
          civil and/or criminal penalties under applicable federal, state and/or
          local law.
        </div>
      </div>
    </footer>
  );
}
