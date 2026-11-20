import { toASCII } from "punycode/";

// The HTML spec's valid email address, the format browsers check in email
// fields, except that the domain needs at least one dot
// https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
const DOMAIN_LABEL = "[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?";
const EMAIL_PATTERN = new RegExp(
  `^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@${DOMAIN_LABEL}(?:\\.${DOMAIN_LABEL})+$`,
);
const NON_ASCII = /[^ -~]/;

// Like a browser email field, converts an internationalized domain to its
// ASCII (punycode) form before checking it, so bücher.de becomes
// xn--bcher-kva.de. Returns the address to submit, or null if it isn't valid.
const parseEmail = ( input: string ): string | null => {
  const email = input.trim( );
  const at = email.lastIndexOf( "@" );
  if ( at < 0 ) return null;
  const domain = email.slice( at + 1 );
  const asciiDomain = NON_ASCII.test( domain )
    ? toASCII( domain.normalize( "NFC" ).toLowerCase( ) )
    : domain;
  const parsed = `${email.slice( 0, at )}@${asciiDomain}`;
  return EMAIL_PATTERN.test( parsed )
    ? parsed
    : null;
};

export default parseEmail;
