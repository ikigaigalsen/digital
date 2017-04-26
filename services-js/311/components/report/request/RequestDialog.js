// @flow

import React from 'react';
import Head from 'next/head';
import { action, observable } from 'mobx';
// import ScopedError from 'react-scoped-error-component';
import { observer } from 'mobx-react';
import { fromPromise } from 'mobx-utils';
import { css } from 'glamor';
import type { Context } from 'next';
import type { IPromiseBasedObservable } from 'mobx-utils';

import type { RequestAdditions } from '../../../server/next-handlers';

import type { SubmittedRequest, Service } from '../../../data/types';
import type { AppStore } from '../../../data/store';
import RequestForm from '../../../data/store/RequestForm';
import makeLoopbackGraphql from '../../../data/dao/loopback-graphql';
import type { LoopbackGraphql } from '../../../data/dao/loopback-graphql';
import submitRequest from '../../../data/dao/submit-request';
import loadService from '../../../data/dao/load-service';

import FormDialog from '../../common/FormDialog';
import SectionHeader from '../../common/SectionHeader';

import { MEDIA_LARGE, CENTERED_DIALOG_STYLE } from '../../style-constants';

import QuestionsPane from './QuestionsPane';
import LocationPopUp from './LocationPopUp';
import ContactPane from './ContactPane';
import SubmitPane from './SubmitPane';

export type InitialProps = {|
  stage: 'questions' | 'location' | 'contact' | 'submit',
  service: ?Service,
  description: string,
|}

export type Props = {|
  store: AppStore,
  loopbackGraphql: LoopbackGraphql,
  routeToServiceForm: (code: string, stage: string) => Promise<void>,
  setLocationMapActive: (active: boolean) => void,
  /* :: ...InitialProps, */
|}

const COMMON_DIALOG_STYLE = {
  transition: 'margin 400ms',
};

const CORNER_DIALOG_STYLE = css(COMMON_DIALOG_STYLE, {
  margin: 0,
  [MEDIA_LARGE]: {
    margin: '-0px 70% 0 40px',
    minWidth: 400,
  },
});

@observer
export default class RequestDialog extends React.Component {
  props: Props;

  requestForm: RequestForm;
  @observable requestSubmission: ?IPromiseBasedObservable<SubmittedRequest> = null;

  // Called by ReportLayout
  static async getInitialProps({ query, req, res }: Context<RequestAdditions>): Promise<InitialProps> {
    const { code, description } = query;
    let stage = query.stage;

    const loopbackGraphql = makeLoopbackGraphql(req);

    const service = await loadService(loopbackGraphql, code);

    if (!service && res) {
      res.statusCode = 404;
    }

    stage = stage || 'questions';

    switch (stage) {
      case 'questions':
      case 'location':
      case 'contact':
      case 'submit':
        return {
          service,
          stage,
          description: description || '',
        };
      default:
        throw new Error(`Unknown stage: ${stage}`);
    }
  }

  @action
  componentWillMount() {
    const { stage, description, setLocationMapActive, service } = this.props;

    this.requestForm = new RequestForm(service);
    this.requestForm.description = description;

    setLocationMapActive(stage === 'location');
  }

  @action
  componentWillReceiveProps(newProps: Props) {
    const { setLocationMapActive, stage } = this.props;

    if (stage !== newProps.stage) {
      setLocationMapActive(newProps.stage === 'location');
    }
  }

  makeNextAfterQuestions(): { fn: () => mixed, isSubmit: boolean } {
    const { requestForm } = this;

    if (requestForm.showLocationPicker) {
      return {
        fn: this.routeToLocation,
        isSubmit: false,
      };
    } else if (requestForm.showContactInfoForm) {
      return {
        fn: this.routeToContact,
        isSubmit: false,
      };
    } else {
      return {
        fn: this.submitRequest,
        isSubmit: true,
      };
    }
  }

  makeNextAfterLocation(): { fn: () => mixed, isSubmit: boolean } {
    const { requestForm } = this;

    if (requestForm.showContactInfoForm) {
      return {
        fn: this.routeToContact,
        isSubmit: false,
      };
    } else {
      return {
        fn: this.submitRequest,
        isSubmit: true,
      };
    }
  }

  routeToLocation = () => {
    const { service, routeToServiceForm } = this.props;
    if (service) {
      routeToServiceForm(service.code, 'location');
    }
  }

  routeToContact = () => {
    const { service, routeToServiceForm } = this.props;
    if (service) {
      routeToServiceForm(service.code, 'contact');
    }
  }

  @action.bound
  submitRequest(): Promise<mixed> {
    const { requestForm } = this;
    const { service, loopbackGraphql, routeToServiceForm } = this.props;
    const { description, firstName, lastName, email, phone, location, address, questions, mediaUrl, sendLocation, sendContactInfo } = requestForm;

    if (!service) {
      throw new Error('service is null in submitRequest');
    }

    const promise = submitRequest(loopbackGraphql, {
      service,
      description,
      // We only send contact info with an affirmative boolean that's set by
      // the ContactPane form's submit button. That way contact info that was
      // loaded by localStorage won't be pushed to the server if the user didn't
      // see the contact info form or chose "submit without sending contact info"
      firstName: sendContactInfo ? firstName : null,
      lastName: sendContactInfo ? lastName : null,
      email: sendContactInfo ? email : null,
      phone: sendContactInfo ? phone : null,
      location: sendLocation ? location : null,
      address: sendLocation ? address : null,
      questions,
      mediaUrl,
    }).then((v) => {
      this.requestForm = new RequestForm(service);
      return v;
    });

    this.requestSubmission = fromPromise(promise);

    routeToServiceForm(service.code, 'submit');

    return promise;
  }

  render() {
    const { stage } = this.props;
    const dialogContainerStyle = stage === 'location' ? CORNER_DIALOG_STYLE : css(COMMON_DIALOG_STYLE, CENTERED_DIALOG_STYLE);

    return (
      <div className={dialogContainerStyle}>
        <Head>
          <title>BOS:311 — {this.renderTitle()}</title>
        </Head>

        <FormDialog narrow={stage === 'contact'} popup={stage === 'location'}>
          { this.renderContent() }
        </FormDialog>
      </div>
    );
  }

  renderTitle() {
    const { requestSubmission } = this;
    const { stage, service } = this.props;

    if (!service) {
      return 'Not Found';
    }

    switch (stage) {
      case 'questions': return service.name;
      case 'location': return 'Choose location';
      case 'contact': return 'Contact information';
      case 'submit':
        if (!requestSubmission) {
          return '';
        }

        switch (requestSubmission.state) {
          case 'pending': return 'Submitting…';
          case 'fulfilled': return `Success: Case ${requestSubmission.value.id}`;
          case 'rejected': return 'Submission error';
          default: return '';
        }

      default: return '';
    }
  }

  renderContent() {
    const { requestSubmission, requestForm } = this;
    const { store, stage, loopbackGraphql, service } = this.props;

    if (!service) {
      return <SectionHeader>Service not found</SectionHeader>;
    }

    // TODO(finh): Bring back service errors
    // if (currentServiceError) {
    //   return (
    //     <div>
    //       <SectionHeader>Error loading service</SectionHeader>
    //       <ScopedError error={currentServiceError} />
    //     </div>
    //   );
    // }

    switch (stage) {
      case 'questions': {
        const { fn, isSubmit } = this.makeNextAfterQuestions();
        return <QuestionsPane store={store} requestForm={requestForm} serviceName={service.name} nextFunc={fn} nextIsSubmit={isSubmit} />;
      }

      case 'location': {
        const { fn, isSubmit } = this.makeNextAfterLocation();
        return <LocationPopUp store={store} requestForm={requestForm} nextFunc={fn} nextIsSubmit={isSubmit} loopbackGraphql={loopbackGraphql} />;
      }

      case 'contact':
        return <ContactPane requestForm={requestForm} serviceName={service.name} nextFunc={this.submitRequest} />;

      case 'submit':
        if (!requestSubmission) {
          return '';
        }

        switch (requestSubmission.state) {
          case 'pending': return <SubmitPane state="submitting" />;
          case 'fulfilled': return <SubmitPane state="success" submittedRequest={requestSubmission.value} />;
          case 'rejected': return <SubmitPane state="error" error={requestSubmission.value} />;
          default: return '';
        }

      default: return null;
    }
  }
}
