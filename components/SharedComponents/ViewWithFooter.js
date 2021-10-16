// @flow strict-local

import * as React from "react";
import Footer from "./Footer";

type Props = {
  children: React.Node
}

const ViewWithFooter = ( { children }: Props ): React.Node => (
  <>
    {children}
    <Footer />
  </>
);

export default ViewWithFooter;
