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

// MODULES //

var isFunction = require( '@stdlib/assert-is-function' );
var format = require( '@stdlib/string-format' );
var reduce = require( './main.js' );


// MAIN //

/**
* Return a function for performing a reduction over a list of specified dimensions in an input ndarray via a one-dimensional strided array reduction function accepting a callback and assigning results to a provided output ndarray.
*
* @param {Function} fcn - wrapper for a one-dimensional strided array reduction function
* @throws {TypeError} first argument must be a function
* @returns {Function} function for performing a reduction
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
* // Create a function for performing a reduction over subarrays:
* var max = factory( maxBy );
* // returns <Function>
*
* // Perform a reduction:
* max( [ x, y ], [ 2, 3 ], clbk );
*
* var arr = ndarray2array( y.data, y.shape, y.strides, y.offset, y.order );
* // returns [ [ 8.0, 16.0, 24.0 ] ]
*/
function factory( fcn ) {
	if ( !isFunction( fcn ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a function. Value: `%s`.', fcn ) );
	}
	return reducer;

	/**
	* Performs a reduction over a list of specified dimensions in an input ndarray via a one-dimensional strided array reduction function according to a callback function and assigns results to a provided output ndarray.
	*
	* @private
	* @param {ArrayLikeObject<Object>} arrays - array-like object containing ndarrays
	* @param {IntegerArray} dims - list of dimensions over which to perform a reduction
	* @param {Options} [options] - function options
	* @param {Function} clbk - callback function
	* @param {thisArg} [thisArg] - callback execution context
	* @returns {void}
	*/
	function reducer( arrays, dims, options, clbk, thisArg ) {
		var nargs = arguments.length;
		if ( nargs < 4 ) {
			return reduce( fcn, arrays, dims, options );
		}
		if ( nargs === 4 ) {
			return reduce( fcn, arrays, dims, options, clbk );
		}
		return reduce( fcn, arrays, dims, options, clbk, thisArg );
	}
}


// EXPORTS //

module.exports = factory;
