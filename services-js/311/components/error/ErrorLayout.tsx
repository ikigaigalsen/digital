// Forked from next.js to add Rollbar error sending

import React from 'react';
import HTTPStatus from 'http-status';
import Head from 'next/head';
import { css } from 'emotion';

import { HEADER_HEIGHT, assetUrl } from '../style-constants';

import FeedbackBanner from '../common/FeedbackBanner';
import Footer from '../common/Footer';
import Nav from '../common/Nav';
import SectionHeader from '../common/SectionHeader';
import FormDialog from '../common/FormDialog';
import { NextContext } from '@cityofboston/next-client-common';

const CONTAINER_STYLE = css({
  minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
  backgroundColor: '#f3a536',
  display: 'flex',
  flexDirection: 'column',
});

const SECTION_HEADER_OVERRIDE_STYLE = css({
  borderColor: 'white',
  ' .sh-title': {
    color: 'white',
  },
});

const IMAGE_STYLE = css({
  margin: '3em auto',
  display: 'block',
});

type Props = {
  statusCode: number;
  store: any;
};

export default class ErrorLayout extends React.Component<Props> {
  static getInitialProps({ res, err }: NextContext<unknown>) {
    const errStatusCode = err ? err.statusCode : null;
    const statusCode = res ? res.statusCode : errStatusCode;

    if (
      process.browser &&
      window.Rollbar &&
      err &&
      err.source !== 'server' &&
      !err._sentToRollbar
    ) {
      window.Rollbar.error(err);
      err._sentToRollbar = true;
    }

    return { statusCode };
  }

  render() {
    const { statusCode } = this.props;
    const title =
      statusCode === 404
        ? 'This page could not be found'
        : HTTPStatus[statusCode] || 'An unexpected error has occurred';

    return (
      <div>
        <Head>
          <title>BOS:311 — {title}</title>
        </Head>

        <Nav />

        <div className={`mn--full ${CONTAINER_STYLE.toString()}`}>
          <FormDialog
            narrow
            style={{
              borderColor: 'transparent',
              backgroundColor: 'transparent',
            }}
          >
            <SectionHeader className={SECTION_HEADER_OVERRIDE_STYLE.toString()}>
              {statusCode} EEEK
            </SectionHeader>

            <div className="t--info m-v400">
              {statusCode === 404
                ? 'That link seems to have scurried away.'
                : 'Looks like that link is playing dead. Please try again later.'}
            </div>

            <img
              className={IMAGE_STYLE.toString()}
              src={assetUrl('img/404-cropped.png')}
              width="700"
              height="280"
              alt=""
            />
          </FormDialog>
        </div>

        <Footer />
        <FeedbackBanner fit="PAGE" />
      </div>
    );
  }
}
