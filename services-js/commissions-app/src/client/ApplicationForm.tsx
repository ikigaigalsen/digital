import React from 'react';
import { FormikProps } from 'formik';

import { ApplyFormValues } from '../lib/validationSchema';

import { Commission } from './graphql/fetch-commissions';

import {
  FileInput,
  SectionHeader,
  Textarea,
  TextInput,
  StatusModal,
} from '@cityofboston/react-fleet';

import ApplicantInformationSection from './ApplicantInformationSection';
import CommissionsListSection from './CommissionsListSection';

type RequiredFormikProps = Pick<
  FormikProps<ApplyFormValues>,
  | 'values'
  | 'errors'
  | 'touched'
  | 'handleBlur'
  | 'handleChange'
  | 'handleSubmit'
  | 'setFieldValue'
  | 'isSubmitting'
  | 'isValid'
>;

export interface Props extends RequiredFormikProps {
  commissionsWithOpenSeats: Commission[];
  commissionsWithoutOpenSeats: Commission[];
  formRef: React.RefObject<HTMLFormElement>;
  submissionError?: boolean;
  clearSubmissionError: () => void;
}

export interface FieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

const PARAGRAPH_STYLING = 't--s400 lh--400';

// todo: https://github.com/CityOfBoston/digital/pull/97/files#r224776915

export default function ApplicationForm(props: Props): JSX.Element {
  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
    isSubmitting,
    isValid,
    submissionError,
    clearSubmissionError,
  } = props;

  const Field = ({ name, label, placeholder, required }: FieldProps) => (
    <TextInput
      small
      name={name}
      label={label}
      placeholder={placeholder}
      error={touched[name] && errors[name]}
      value={values[name]}
      id={`ApplicationForm-${name}`}
      onBlur={handleBlur}
      onChange={handleChange}
      required={required}
    />
  );

  return (
    <form onSubmit={handleSubmit} ref={props.formRef}>
      <h1 className="sh-title">Boards and Commissions Application Form</h1>

      <p className={PARAGRAPH_STYLING}>
        Please note that many of these Boards and Commissions require City of
        Boston residency as well as specific qualifications for members. Please
        familiarize yourself with each board or commissions’s enabling
        legislation. If you have any questions, email{' '}
        <a href="mailto:boardsandcommissions@boston.gov">
          boardsandcommissions@boston.gov
        </a>.
      </p>

      <ApplicantInformationSection Field={Field} />

      <hr className="hr hr--sq" />

      <section>
        <SectionHeader title="Education and Experience" />

        <Field
          label="Degree Attained"
          name="degreeAttained"
          placeholder="Degree Attained"
        />

        <Field
          label="Educational Institution"
          name="educationalInstitution"
          placeholder="Educational Institution"
        />

        <Textarea
          name="otherInformation"
          label="Relevant Work Experience"
          placeholder="Other information..."
          value={values.otherInformation}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched['otherInformation'] && errors['otherInformation']}
          rows={3}
          small
        />
      </section>

      <hr className="hr hr--sq" />

      <CommissionsListSection
        commissionsWithOpenSeats={props.commissionsWithOpenSeats}
        commissionsWithoutOpenSeats={props.commissionsWithoutOpenSeats}
        selectedCommissionIds={values.commissionIds}
        errors={errors}
        paragraphElement={
          <p className={PARAGRAPH_STYLING}>
            You can apply for a board or commission that does not currently have
            any open positions, and we will review your application when a seat
            opens.
          </p>
        }
      />

      <hr className="hr hr--sq" />

      <section>
        <SectionHeader title="Reference Information" />

        <p className="m-b400">Files must be PDFs and under 5MB each in size.</p>

        <FileInput
          name="coverLetter"
          title="Cover Letter"
          fileTypes={['application/pdf']}
          sizeLimit={{ amount: 5, unit: 'MB' }}
          handleChange={setFieldValue}
        />

        <FileInput
          name="resume"
          title="Resumé"
          fileTypes={['application/pdf']}
          sizeLimit={{ amount: 5, unit: 'MB' }}
          handleChange={setFieldValue}
        />
      </section>

      <hr className="hr hr--sq" style={{ marginTop: '3rem' }} />

      <button
        type="submit"
        className="btn btn--700"
        disabled={isSubmitting || !isValid || submissionError}
      >
        {isSubmitting ? 'Submitting…' : 'Submit Application'}
      </button>

      {isSubmitting && (
        <StatusModal message="Submitting application…" waiting>
          <div className="t--info m-t300">
            Please be patient and don’t refresh your browser. This might take a
            bit.
          </div>
        </StatusModal>
      )}

      {submissionError && (
        <StatusModal
          message="Something went wrong!"
          error
          onClose={clearSubmissionError}
        >
          <div className="t--info m-t300">
            You can try again. If this keeps happening, please contact{' '}
            <a href="mailto:boardsandcommissions@boston.gov">
              boardsandcommissions@boston.gov
            </a>.
          </div>
        </StatusModal>
      )}
    </form>
  );
}
