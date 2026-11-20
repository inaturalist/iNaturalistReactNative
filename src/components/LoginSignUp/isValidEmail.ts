// The HTML spec's valid email address, the format browsers check in email
// fields, except that the domain needs at least one dot
// https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
const DOMAIN_LABEL = "[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?";
const EMAIL_PATTERN = new RegExp(
  `^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@${DOMAIN_LABEL}(?:\\.${DOMAIN_LABEL})+$`,
);

const isValidEmail = ( email: string ): boolean => EMAIL_PATTERN.test( email );

export default isValidEmail;
