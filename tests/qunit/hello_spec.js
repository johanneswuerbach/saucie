module( "hello" );

QUnit.test( "should say hello", function() {
  QUnit.equal( hello(), 'hello world' );
});

QUnit.test( "should say hello to person", function() {
  QUnit.equal( hello('Bob'), 'hello Bob' );
});
