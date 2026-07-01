import AddToProjects from "components/AddToProjects/AddToProjects";
import React from "react";
import { renderComponent } from "tests/helpers/render";

function renderAddToProjects( ) {
  return renderComponent(
    <AddToProjects />,
  );
}
describe( "AddToProjects", () => {
  it( "renders section headers and collection/umbrella explainer", ( ) => {
    renderAddToProjects( );
  } );
} );
