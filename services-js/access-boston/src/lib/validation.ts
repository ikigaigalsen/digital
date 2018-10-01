import * as yup from 'yup';

export function analyzePassword(password: string) {
  password = password || '';

  const longEnough = password.length >= 10;
  const hasLowercase = !!password.match(/[a-z]/);
  const hasUppercase = !!password.match(/[A-Z]/);
  const hasNumber = !!password.match(/\d/);
  // We clear out spaces from the symbol check so that it doesn't fire for them.
  const hasSymbol = !!password.replace(/\s/g, '').match(/[\W_]/);

  const complexEnough =
    [hasLowercase, hasUppercase, hasNumber, hasSymbol].filter(b => b).length >=
    3;

  const tooLong = password.length > 32;
  const hasSpaces = !!password.match(/\s/);

  return {
    longEnough,
    complexEnough,
    hasLowercase,
    hasUppercase,
    hasNumber,
    hasSymbol,
    tooLong,
    hasSpaces,
  };
}

const NEW_PASSWORD_SHAPE = {
  newPassword: yup
    .string()
    .test(
      'longEnough',
      'Your new password must be at least 10 characters',
      val => analyzePassword(val).longEnough
    )
    .test(
      'complexEnough',
      'Your new password must have more different types of characters',
      val => analyzePassword(val).complexEnough
    )
    .test(
      'tooLong',
      'Your new password must be 32 characters or less',
      val => !analyzePassword(val).tooLong
    )
    .test(
      'hasSpaces',
      'Your new password can’t have spaces',
      val => !analyzePassword(val).hasSpaces
    )
    .required('Please put in a new password'),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf(
      [yup.ref('newPassword')],
      'The password confirmation does not match your new password'
    ),
};

export const changePasswordSchema = yup.object().shape({
  password: yup.string().required('Your current password is required'),
  ...NEW_PASSWORD_SHAPE,
});

export const forgotPasswordSchema = yup.object().shape({
  ...NEW_PASSWORD_SHAPE,
});

/**
 * Helper method to pull errors out of a Yup ValidationError and add them to a
 * map of key -> error strings.
 *
 * Recursively traverses the Validation error to find everything inside.
 */
export function addValidationError(
  errorMap: { [key: string]: string },
  err: yup.ValidationError
) {
  if (err.path) {
    errorMap[err.path] = err.message;
  }

  err.inner.forEach(innerErr => {
    addValidationError(errorMap, innerErr);
  });
}

const CITY_DOMAINS = [
  'boston.gov',
  'cityofboston.gov',
  'bpl.org',
  'bostonpublicschools.org',
];

const CITY_DOMAIN_REGEXPS = CITY_DOMAINS.map(
  d => new RegExp(`[@.]${d.replace(/\./g, '\\.')}$`, 'i')
);

// This can get called w/ an undefined value, apparently.
export function testNotCityEmailAddress(val: string | undefined): boolean {
  return !val || !CITY_DOMAIN_REGEXPS.find(r => !!val.match(r));
}
