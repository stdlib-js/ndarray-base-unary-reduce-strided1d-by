/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

'use strict';

var discreteUniform = require( '@stdlib/random-array-discrete-uniform' );
var zeros = require( '@stdlib/array-base-zeros' );
var ndarray2array = require( '@stdlib/ndarray-base-to-array' );
var maxBy = require( '@stdlib/stats-base-ndarray-max-by' );
var unaryReduceStrided1dBy = require( './../lib' );

function clbk( value ) {
	return value * 2.0;
}

var N = 10;
var x = {
	'dtype': 'generic',
	'data': discreteUniform( N, -5, 5, {
		'dtype': 'generic'
	}),
	'shape': [ 1, 5, 2 ],
	'strides': [ 10, 2, 1 ],
	'offset': 0,
	'order': 'row-major'
};
var y = {
	'dtype': 'generic',
	'data': zeros( 5 ),
	'shape': [ 1, 5 ],
	'strides': [ 5, 1 ],
	'offset': 0,
	'order': 'row-major'
};

unaryReduceStrided1dBy( maxBy, [ x, y ], [ 2 ], clbk );

console.log( ndarray2array( x.data, x.shape, x.strides, x.offset, x.order ) );
console.log( ndarray2array( y.data, y.shape, y.strides, y.offset, y.order ) );
