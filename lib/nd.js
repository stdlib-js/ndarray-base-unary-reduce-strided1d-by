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

/* eslint-disable max-len, max-params */

'use strict';

// MODULES //

var numel = require( '@stdlib/ndarray-base-numel' );
var vind2bind = require( '@stdlib/ndarray-base-vind2bind' );
var ind2sub = require( '@stdlib/ndarray-base-ind2sub' );
var copyIndexed = require( '@stdlib/array-base-copy-indexed' );
var zeros = require( '@stdlib/array-base-zeros' );
var setViewOffsets = require( './set_view_offsets.js' );
var offsets = require( './offsets.js' );
var wrap = require( './callback_wrapper.js' );


// VARIABLES //

var MODE = 'throw';


// MAIN //

/**
* Performs a reduction over an input ndarray according to a callback function and assigns results to a provided output ndarray.
*
* @private
* @param {Function} fcn - wrapper for a one-dimensional strided array reduction function
* @param {Array<Object>} arrays - ndarrays
* @param {Function} strategy - input ndarray reshape strategy
* @param {Array<Object>} views - initialized ndarray-like objects representing sub-array views
* @param {NonNegativeIntegerArray} ibuf - workspace for storing iteration indices
* @param {NonNegativeIntegerArray} ldims - list of loop dimensions
* @param {NonNegativeIntegerArray} cdims - list of "core" dimensions
* @param {IntegerArray} strides - loop dimension strides for the input ndarray
* @param {Options} opts - function options
* @param {boolean} hasOpts - boolean indicating whether to pass an options argument to a reduction function
* @param {Function} clbk - callback function
* @param {*} thisArg - callback exection context
* @returns {void}
*
* @example
* var Float64Array = require( '@stdlib/array-float64' );
* var ndarray2array = require( '@stdlib/ndarray-base-to-array' );
* var maxBy = require( '@stdlib/stats-base-ndarray-max-by' );
*
* function clbk( value ) {
*     return value * 2.0;
* }
*
* // Create data buffers:
* var xbuf = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0 ] );
* var ybuf = new Float64Array( [ 0.0, 0.0, 0.0 ] );
*
* // Define the array shapes:
* var xsh = [ 1, 3, 2, 2 ];
* var ysh = [ 1, 3 ];
*
* // Define the array strides:
* var sx = [ 12, 4, 2, 1 ];
* var sy = [ 3, 1 ];
*
* // Define the index offsets:
* var ox = 0;
* var oy = 0;
*
* // Create an input ndarray-like object:
* var x = {
*     'dtype': 'float64',
*     'data': xbuf,
*     'shape': xsh,
*     'strides': sx,
*     'offset': ox,
*     'order': 'row-major'
* };
*
* // Create an output ndarray-like object:
* var y = {
*     'dtype': 'float64',
*     'data': ybuf,
*     'shape': ysh,
*     'strides': sy,
*     'offset': oy,
*     'order': 'row-major'
* };
*
* // Initialize ndarray-like objects representing sub-array views:
* var views = [
*     {
*         'dtype': x.dtype,
*         'data': x.data,
*         'shape': [ 2, 2 ],
*         'strides': [ 2, 1 ],
*         'offset': x.offset,
*         'order': x.order
*     }
* ];
*
* // Define a reshape strategy:
* function strategy( x ) {
*     return {
*         'dtype': x.dtype,
*         'data': x.data,
*         'shape': [ 4 ],
*         'strides': [ 1 ],
*         'offset': x.offset,
*         'order': x.order
*     };
* }
*
* // Create a workspace array for storing iteration indices:
* var ibuf = zeros( xsh.length );
*
* // Define the loop and core dimensions:
* var ldims = [ 0, 1 ];
* var cdims = [ 2, 3 ];
*
* // Resolve the loop dimension strides for the input array:
* var slx = [ 12, 4 ];
*
* // Perform a reduction:
* unarynd( maxBy, [ x, y ], strategy, views, ibuf, ldims, cdims, slx, {}, false, clbk, {} );
*
* var arr = ndarray2array( y.data, y.shape, y.strides, y.offset, y.order );
* // returns [ [ 8.0, 16.0, 24.0 ] ]
*/
function unarynd( fcn, arrays, strategy, views, ibuf, ldims, cdims, strides, opts, hasOpts, clbk, thisArg ) {
	var ybuf;
	var len;
	var arr;
	var sub;
	var sh;
	var iv;
	var io;
	var N;
	var x;
	var y;
	var v;
	var i;
	var j;
	var f;

	N = arrays.length;

	// Cache a reference to the input ndarray:
	x = arrays[ 0 ];

	// Resolve the output ndarray and associated shape:
	y = arrays[ 1 ];
	sh = y.shape;

	// Compute the total number of elements over which to iterate:
	len = numel( sh );

	// Resolve a list of pointers to the first indexed elements in the respective ndarrays:
	iv = offsets( arrays );

	// Shallow copy the list of views to an internal array so that we can update with reshaped views without impacting the original list of views:
	v = copyIndexed( views );

	// Cache a reference to the output ndarray buffer:
	ybuf = y.data;

	// Iterate based on the linear **view** index, regardless as to how the data is stored in memory...
	io = zeros( N );
	for ( i = 0; i < len; i++ ) {
		for ( j = 0; j < N; j++ ) {
			arr = arrays[ j ];
			io[ j ] = vind2bind( sh, arr.strides, iv[ j ], arr.order, i, MODE );
		}
		setViewOffsets( views, io );
		v[ 0 ] = strategy( views[ 0 ] );
		sub = ind2sub( sh, strides, 0, x.order, i, MODE );
		f = wrap( x.ref, views[ 0 ], ibuf, ldims, sub, cdims, clbk, thisArg );
		ybuf[ io[1] ] = ( hasOpts ) ? fcn( v, f, opts ) : fcn( v, f );
	}
}


// EXPORTS //

module.exports = unarynd;
