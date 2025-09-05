import {
  addPageParamsForExplore,
  getNextPageParamForExplore
} from "components/Explore/helpers/exploreParams";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";

describe( "getNextPageParamForExplore", ( ) => {
  const page = makeResponse( [factory( "RemoteObservation" )] );
  it( "should return a date string if order_by is observed_on", ( ) => {
    const params = { order_by: "observed_on" };
    expect( getNextPageParamForExplore( page, params ) ).toMatch( /\d{4}-\d{2}-\d{2}/ );
  } );
  it( "should return a date string if order_by is created_at", ( ) => {
    const params = { order_by: "created_at" };
    expect( getNextPageParamForExplore( page, params ) ).toMatch( /\d{4}-\d{2}-\d{2}/ );
  } );
  it( "should return an obs id if order_by is blank", ( ) => {
    const params = { };
    expect( getNextPageParamForExplore( page, params ) ).toEqual( page.results[0].id );
  } );
  it( "should return the next page number if order_by is votes", ( ) => {
    const params = { order_by: "votes" };
    expect( getNextPageParamForExplore( page, params ) ).toEqual( page.page + 1 );
  } );
} );

describe( "addPageParamsForExplore", ( ) => {
  it( "should include return_bounds when pageParam is undefined", ( ) => {
    const params = {};
    expect( addPageParamsForExplore( params ).return_bounds ).toEqual( true );
  } );
  it( "should include return_bounds when pageParam is 0", ( ) => {
    const params = { pageParam: 0 };
    expect( addPageParamsForExplore( params ).return_bounds ).toEqual( true );
  } );
  it( "should not include return_bounds when pageParam is 1 ", ( ) => {
    const params = { pageParam: 1 };
    expect( addPageParamsForExplore( params ).return_bounds ).toBeUndefined( );
  } );
  it( "should set d2 if order_by is observed_on and order is default desc", ( ) => {
    const dateString = faker.date.recent( ).toISOString( );
    const params = { pageParam: dateString, order_by: "observed_on" };
    expect( addPageParamsForExplore( params ).d2 ).toEqual( dateString );
  } );
  it( "should set d1 if order_by is observed_on and order is asc", ( ) => {
    const dateString = faker.date.recent( ).toISOString( );
    const params = { pageParam: dateString, order_by: "observed_on", order: "asc" };
    expect( addPageParamsForExplore( params ).d1 ).toEqual( dateString );
  } );
  it( "should set created_d2 if order_by is created_at and order is default desc", ( ) => {
    const dateString = faker.date.recent( ).toISOString( );
    const params = { pageParam: dateString, order_by: "created_at" };
    expect( addPageParamsForExplore( params ).created_d2 ).toEqual( dateString );
  } );
  it( "should set created_d1 if order_by is created_at and order is asc", ( ) => {
    const dateString = faker.date.recent( ).toISOString( );
    const params = { pageParam: dateString, order_by: "created_at", order: "asc" };
    expect( addPageParamsForExplore( params ).created_d1 ).toEqual( dateString );
  } );
  it( "should set page if order_by is votes", ( ) => {
    const params = { order_by: "votes", pageParam: 1 };
    expect( addPageParamsForExplore( params ).page ).toEqual( params.pageParam );
  } );
  it( "should set id_below if order_by is not specified", ( ) => {
    const params = { pageParam: 123 };
    expect( addPageParamsForExplore( params ).id_below ).toEqual( params.pageParam );
  } );
} );
