/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.2.1
 */

/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


(function(_global) {
  "use strict";

  var shim = {};
  if (typeof(exports) === 'undefined') {
    if(typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
      shim.exports = {};
      define(function() {
        return shim.exports;
      });
    } else {
      // gl-matrix lives in a browser, define its namespaces in global
      shim.exports = typeof(window) !== 'undefined' ? window : _global;
    }
  }
  else {
    // gl-matrix lives in commonjs, define its namespaces in exports
    shim.exports = exports;
  }

  (function(exports) {
    /* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}

if(!GLMAT_ARRAY_TYPE) {
    var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
}

if(!GLMAT_RANDOM) {
    var GLMAT_RANDOM = Math.random;
}

/**
 * @class Common utilities
 * @name glMatrix
 */
var glMatrix = {};

/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */
glMatrix.setMatrixArrayType = function(type) {
    GLMAT_ARRAY_TYPE = type;
}

if(typeof(exports) !== 'undefined') {
    exports.glMatrix = glMatrix;
}

var degree = Math.PI / 180;

/**
* Convert Degree To Radian
*
* @param {Number} Angle in Degrees
*/
glMatrix.toRadian = function(a){
     return a * degree;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2 Dimensional Vector
 * @name vec2
 */

var vec2 = {};

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
vec2.create = function() {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = 0;
    out[1] = 0;
    return out;
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
vec2.sub = vec2.subtract;

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
vec2.mul = vec2.multiply;

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for {@link vec2.divide}
 * @function
 */
vec2.div = vec2.divide;

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */
vec2.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.distance}
 * @function
 */
vec2.dist = vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
vec2.sqrDist = vec2.squaredDistance;

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.length}
 * @function
 */
vec2.len = vec2.length;

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
vec2.sqrLen = vec2.squaredLength;

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
vec2.cross = function(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
};

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */
vec2.random = function (out, scale) {
    scale = scale || 1.0;
    var r = GLMAT_RANDOM() * 2.0 * Math.PI;
    out[0] = Math.cos(r) * scale;
    out[1] = Math.sin(r) * scale;
    return out;
};

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
};

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2d = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
};

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat3 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
};

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat4 = function(out, a, m) {
    var x = a[0], 
        y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
};

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec2.forEach = (function() {
    var vec = vec2.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 2;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec2} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec2 = vec2;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */

var vec3 = {};

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
vec3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
};

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
vec3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
vec3.fromValues = function(x, y, z) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
vec3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
vec3.set = function(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
};

/**
 * Alias for {@link vec3.subtract}
 * @function
 */
vec3.sub = vec3.subtract;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
};

/**
 * Alias for {@link vec3.multiply}
 * @function
 */
vec3.mul = vec3.multiply;

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
};

/**
 * Alias for {@link vec3.divide}
 * @function
 */
vec3.div = vec3.divide;

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
};

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
};

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
vec3.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
};

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
vec3.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
vec3.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.distance}
 * @function
 */
vec3.dist = vec3.distance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec3.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */
vec3.sqrDist = vec3.squaredDistance;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
vec3.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.length}
 * @function
 */
vec3.len = vec3.length;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec3.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */
vec3.sqrLen = vec3.squaredLength;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
vec3.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
};

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
vec3.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    var len = x*x + y*y + z*z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
vec3.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.cross = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */
vec3.random = function (out, scale) {
    scale = scale || 1.0;

    var r = GLMAT_RANDOM() * 2.0 * Math.PI;
    var z = (GLMAT_RANDOM() * 2.0) - 1.0;
    var zScale = Math.sqrt(1.0-z*z) * scale;

    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale;
    return out;
};

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
    return out;
};

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat3 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
};

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
vec3.transformQuat = function(out, a, q) {
    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/*
* Rotate a 3D vector around the x-axis
* @param {vec3} out The receiving vec3
* @param {vec3} a The vec3 point to rotate
* @param {vec3} b The origin of the rotation
* @param {Number} c The angle of rotation
* @returns {vec3} out
*/
vec3.rotateX = function(out, a, b, c){
   var p = [], r=[];
	  //Translate point to the origin
	  p[0] = a[0] - b[0];
	  p[1] = a[1] - b[1];
  	p[2] = a[2] - b[2];

	  //perform rotation
	  r[0] = p[0];
	  r[1] = p[1]*Math.cos(c) - p[2]*Math.sin(c);
	  r[2] = p[1]*Math.sin(c) + p[2]*Math.cos(c);

	  //translate to correct position
	  out[0] = r[0] + b[0];
	  out[1] = r[1] + b[1];
	  out[2] = r[2] + b[2];

  	return out;
};

/*
* Rotate a 3D vector around the y-axis
* @param {vec3} out The receiving vec3
* @param {vec3} a The vec3 point to rotate
* @param {vec3} b The origin of the rotation
* @param {Number} c The angle of rotation
* @returns {vec3} out
*/
vec3.rotateY = function(out, a, b, c){
  	var p = [], r=[];
  	//Translate point to the origin
  	p[0] = a[0] - b[0];
  	p[1] = a[1] - b[1];
  	p[2] = a[2] - b[2];
  
  	//perform rotation
  	r[0] = p[2]*Math.sin(c) + p[0]*Math.cos(c);
  	r[1] = p[1];
  	r[2] = p[2]*Math.cos(c) - p[0]*Math.sin(c);
  
  	//translate to correct position
  	out[0] = r[0] + b[0];
  	out[1] = r[1] + b[1];
  	out[2] = r[2] + b[2];
  
  	return out;
};

/*
* Rotate a 3D vector around the z-axis
* @param {vec3} out The receiving vec3
* @param {vec3} a The vec3 point to rotate
* @param {vec3} b The origin of the rotation
* @param {Number} c The angle of rotation
* @returns {vec3} out
*/
vec3.rotateZ = function(out, a, b, c){
  	var p = [], r=[];
  	//Translate point to the origin
  	p[0] = a[0] - b[0];
  	p[1] = a[1] - b[1];
  	p[2] = a[2] - b[2];
  
  	//perform rotation
  	r[0] = p[0]*Math.cos(c) - p[1]*Math.sin(c);
  	r[1] = p[0]*Math.sin(c) + p[1]*Math.cos(c);
  	r[2] = p[2];
  
  	//translate to correct position
  	out[0] = r[0] + b[0];
  	out[1] = r[1] + b[1];
  	out[2] = r[2] + b[2];
  
  	return out;
};

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec3.forEach = (function() {
    var vec = vec3.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 3;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec3} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec3.str = function (a) {
    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec3 = vec3;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4 Dimensional Vector
 * @name vec4
 */

var vec4 = {};

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
vec4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    return out;
};

/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
vec4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
vec4.fromValues = function(x, y, z, w) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
vec4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
vec4.set = function(out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};

/**
 * Alias for {@link vec4.subtract}
 * @function
 */
vec4.sub = vec4.subtract;

/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];
    return out;
};

/**
 * Alias for {@link vec4.multiply}
 * @function
 */
vec4.mul = vec4.multiply;

/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    out[3] = a[3] / b[3];
    return out;
};

/**
 * Alias for {@link vec4.divide}
 * @function
 */
vec4.div = vec4.divide;

/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    out[3] = Math.min(a[3], b[3]);
    return out;
};

/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    out[3] = Math.max(a[3], b[3]);
    return out;
};

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
vec4.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};

/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */
vec4.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    out[3] = a[3] + (b[3] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */
vec4.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.distance}
 * @function
 */
vec4.dist = vec4.distance;

/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec4.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */
vec4.sqrDist = vec4.squaredDistance;

/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
vec4.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.length}
 * @function
 */
vec4.len = vec4.length;

/**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec4.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */
vec4.sqrLen = vec4.squaredLength;

/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */
vec4.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = -a[3];
    return out;
};

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
vec4.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    var len = x*x + y*y + z*z + w*w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
        out[3] = a[3] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
vec4.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */
vec4.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    out[3] = aw + t * (b[3] - aw);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */
vec4.random = function (out, scale) {
    scale = scale || 1.0;

    //TODO: This is a pretty awful way of doing this. Find something better.
    out[0] = GLMAT_RANDOM();
    out[1] = GLMAT_RANDOM();
    out[2] = GLMAT_RANDOM();
    out[3] = GLMAT_RANDOM();
    vec4.normalize(out, out);
    vec4.scale(out, out, scale);
    return out;
};

/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */
vec4.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2], w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
};

/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
vec4.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec4.forEach = (function() {
    var vec = vec4.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 4;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec4} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec4.str = function (a) {
    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec4 = vec4;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x2 Matrix
 * @name mat2
 */

var mat2 = {};

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */
mat2.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {mat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */
mat2.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */
mat2.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a1 = a[1];
        out[1] = a[2];
        out[2] = a1;
    } else {
        out[0] = a[0];
        out[1] = a[2];
        out[2] = a[1];
        out[3] = a[3];
    }
    
    return out;
};

/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],

        // Calculate the determinant
        det = a0 * a3 - a2 * a1;

    if (!det) {
        return null;
    }
    det = 1.0 / det;
    
    out[0] =  a3 * det;
    out[1] = -a1 * det;
    out[2] = -a2 * det;
    out[3] =  a0 * det;

    return out;
};

/**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.adjoint = function(out, a) {
    // Caching this value is nessecary if out == a
    var a0 = a[0];
    out[0] =  a[3];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] =  a0;

    return out;
};

/**
 * Calculates the determinant of a mat2
 *
 * @param {mat2} a the source matrix
 * @returns {Number} determinant of a
 */
mat2.determinant = function (a) {
    return a[0] * a[3] - a[2] * a[1];
};

/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
mat2.multiply = function (out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = a0 * b0 + a2 * b1;
    out[1] = a1 * b0 + a3 * b1;
    out[2] = a0 * b2 + a2 * b3;
    out[3] = a1 * b2 + a3 * b3;
    return out;
};

/**
 * Alias for {@link mat2.multiply}
 * @function
 */
mat2.mul = mat2.multiply;

/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
mat2.rotate = function (out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a2 * s;
    out[1] = a1 *  c + a3 * s;
    out[2] = a0 * -s + a2 * c;
    out[3] = a1 * -s + a3 * c;
    return out;
};

/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/
mat2.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v0;
    out[2] = a2 * v1;
    out[3] = a3 * v1;
    return out;
};

/**
 * Returns a string representation of a mat2
 *
 * @param {mat2} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2.str = function (a) {
    return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

/**
 * Returns Frobenius norm of a mat2
 *
 * @param {mat2} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat2.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2)))
};

/**
 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
 * @param {mat2} L the lower triangular matrix 
 * @param {mat2} D the diagonal matrix 
 * @param {mat2} U the upper triangular matrix 
 * @param {mat2} a the input matrix to factorize
 */

mat2.LDU = function (L, D, U, a) { 
    L[2] = a[2]/a[0]; 
    U[0] = a[0]; 
    U[1] = a[1]; 
    U[3] = a[3] - L[2] * U[1]; 
    return [L, D, U];       
}; 

if(typeof(exports) !== 'undefined') {
    exports.mat2 = mat2;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x3 Matrix
 * @name mat2d
 * 
 * @description 
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, c, tx,
 *  b, d, ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, c, tx,
 *  b, d, ty,
 *  0, 0, 1]
 * </pre>
 * The last row is ignored so the array is shorter and operations are faster.
 */

var mat2d = {};

/**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.create = function() {
    var out = new GLMAT_ARRAY_TYPE(6);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {mat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(6);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */
mat2d.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.invert = function(out, a) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5];

    var det = aa * ad - ab * ac;
    if(!det){
        return null;
    }
    det = 1.0 / det;

    out[0] = ad * det;
    out[1] = -ab * det;
    out[2] = -ac * det;
    out[3] = aa * det;
    out[4] = (ac * aty - ad * atx) * det;
    out[5] = (ab * atx - aa * aty) * det;
    return out;
};

/**
 * Calculates the determinant of a mat2d
 *
 * @param {mat2d} a the source matrix
 * @returns {Number} determinant of a
 */
mat2d.determinant = function (a) {
    return a[0] * a[3] - a[1] * a[2];
};

/**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
mat2d.multiply = function (out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
    out[0] = a0 * b0 + a2 * b1;
    out[1] = a1 * b0 + a3 * b1;
    out[2] = a0 * b2 + a2 * b3;
    out[3] = a1 * b2 + a3 * b3;
    out[4] = a0 * b4 + a2 * b5 + a4;
    out[5] = a1 * b4 + a3 * b5 + a5;
    return out;
};

/**
 * Alias for {@link mat2d.multiply}
 * @function
 */
mat2d.mul = mat2d.multiply;


/**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
mat2d.rotate = function (out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a2 * s;
    out[1] = a1 *  c + a3 * s;
    out[2] = a0 * -s + a2 * c;
    out[3] = a1 * -s + a3 * c;
    out[4] = a4;
    out[5] = a5;
    return out;
};

/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/
mat2d.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v0;
    out[2] = a2 * v1;
    out[3] = a3 * v1;
    out[4] = a4;
    out[5] = a5;
    return out;
};

/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/
mat2d.translate = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        v0 = v[0], v1 = v[1];
    out[0] = a0;
    out[1] = a1;
    out[2] = a2;
    out[3] = a3;
    out[4] = a0 * v0 + a2 * v1 + a4;
    out[5] = a1 * v0 + a3 * v1 + a5;
    return out;
};

/**
 * Returns a string representation of a mat2d
 *
 * @param {mat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2d.str = function (a) {
    return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ')';
};

/**
 * Returns Frobenius norm of a mat2d
 *
 * @param {mat2d} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat2d.frob = function (a) { 
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + 1))
}; 

if(typeof(exports) !== 'undefined') {
    exports.mat2d = mat2d;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3x3 Matrix
 * @name mat3
 */

var mat3 = {};

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
mat3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
mat3.fromMat4 = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[4];
    out[4] = a[5];
    out[5] = a[6];
    out[6] = a[8];
    out[7] = a[9];
    out[8] = a[10];
    return out;
};

/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
mat3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
mat3.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a12 = a[5];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a01;
        out[5] = a[7];
        out[6] = a02;
        out[7] = a12;
    } else {
        out[0] = a[0];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a[1];
        out[4] = a[4];
        out[5] = a[7];
        out[6] = a[2];
        out[7] = a[5];
        out[8] = a[8];
    }
    
    return out;
};

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,

        // Calculate the determinant
        det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
};

/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    out[0] = (a11 * a22 - a12 * a21);
    out[1] = (a02 * a21 - a01 * a22);
    out[2] = (a01 * a12 - a02 * a11);
    out[3] = (a12 * a20 - a10 * a22);
    out[4] = (a00 * a22 - a02 * a20);
    out[5] = (a02 * a10 - a00 * a12);
    out[6] = (a10 * a21 - a11 * a20);
    out[7] = (a01 * a20 - a00 * a21);
    out[8] = (a00 * a11 - a01 * a10);
    return out;
};

/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
mat3.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
};

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b00 = b[0], b01 = b[1], b02 = b[2],
        b10 = b[3], b11 = b[4], b12 = b[5],
        b20 = b[6], b21 = b[7], b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
};

/**
 * Alias for {@link mat3.multiply}
 * @function
 */
mat3.mul = mat3.multiply;

/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
mat3.translate = function(out, a, v) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],
        x = v[0], y = v[1];

    out[0] = a00;
    out[1] = a01;
    out[2] = a02;

    out[3] = a10;
    out[4] = a11;
    out[5] = a12;

    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
};

/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
mat3.rotate = function (out, a, rad) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        s = Math.sin(rad),
        c = Math.cos(rad);

    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;

    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;

    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
};

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
mat3.scale = function(out, a, v) {
    var x = v[0], y = v[1];

    out[0] = x * a[0];
    out[1] = x * a[1];
    out[2] = x * a[2];

    out[3] = y * a[3];
    out[4] = y * a[4];
    out[5] = y * a[5];

    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat2d} a the matrix to copy
 * @returns {mat3} out
 **/
mat3.fromMat2d = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = 0;

    out[3] = a[2];
    out[4] = a[3];
    out[5] = 0;

    out[6] = a[4];
    out[7] = a[5];
    out[8] = 1;
    return out;
};

/**
* Calculates a 3x3 matrix from the given quaternion
*
* @param {mat3} out mat3 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat3} out
*/
mat3.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[3] = yx - wz;
    out[6] = zx + wy;

    out[1] = yx + wz;
    out[4] = 1 - xx - zz;
    out[7] = zy - wx;

    out[2] = zx - wy;
    out[5] = zy + wx;
    out[8] = 1 - xx - yy;

    return out;
};

/**
* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
*
* @param {mat3} out mat3 receiving operation result
* @param {mat4} a Mat4 to derive the normal matrix from
*
* @returns {mat3} out
*/
mat3.normalFromMat4 = function (out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

    return out;
};

/**
 * Returns a string representation of a mat3
 *
 * @param {mat3} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat3.str = function (a) {
    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + 
                    a[6] + ', ' + a[7] + ', ' + a[8] + ')';
};

/**
 * Returns Frobenius norm of a mat3
 *
 * @param {mat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat3.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2)))
};


if(typeof(exports) !== 'undefined') {
    exports.mat3 = mat3;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4x4 Matrix
 * @name mat4
 */

var mat4 = {};

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
mat4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
mat4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
mat4.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a03 = a[3],
            a12 = a[6], a13 = a[7],
            a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }
    
    return out;
};

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};

/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
    return out;
};

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
mat4.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};

/**
 * Multiplies two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
};

/**
 * Alias for {@link mat4.multiply}
 * @function
 */
mat4.mul = mat4.multiply;

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4.translate = function (out, a, v) {
    var x = v[0], y = v[1], z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
mat4.scale = function(out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Rotates a mat4 by the given angle
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4.rotate = function (out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (Math.abs(len) < GLMAT_EPSILON) { return null; }
    
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
};

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateX = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[0]  = a[0];
        out[1]  = a[1];
        out[2]  = a[2];
        out[3]  = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateY = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[4]  = a[4];
        out[5]  = a[5];
        out[6]  = a[6];
        out[7]  = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateZ = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
};

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4.fromRotationTranslation = function (out, q, v) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    
    return out;
};

mat4.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;

    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;

    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
};

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.frustum = function (out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
    out[0] = (near * 2) * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = (near * 2) * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (far * near * 2) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.perspective = function (out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.ortho = function (out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
mat4.lookAt = function (out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < GLMAT_EPSILON &&
        Math.abs(eyey - centery) < GLMAT_EPSILON &&
        Math.abs(eyez - centerz) < GLMAT_EPSILON) {
        return mat4.identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
};

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat4.str = function (a) {
    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + 
                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
};

/**
 * Returns Frobenius norm of a mat4
 *
 * @param {mat4} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat4.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) + Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2) ))
};


if(typeof(exports) !== 'undefined') {
    exports.mat4 = mat4;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class Quaternion
 * @name quat
 */

var quat = {};

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
quat.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {vec3} a the initial vector
 * @param {vec3} b the destination vector
 * @returns {quat} out
 */
quat.rotationTo = (function() {
    var tmpvec3 = vec3.create();
    var xUnitVec3 = vec3.fromValues(1,0,0);
    var yUnitVec3 = vec3.fromValues(0,1,0);

    return function(out, a, b) {
        var dot = vec3.dot(a, b);
        if (dot < -0.999999) {
            vec3.cross(tmpvec3, xUnitVec3, a);
            if (vec3.length(tmpvec3) < 0.000001)
                vec3.cross(tmpvec3, yUnitVec3, a);
            vec3.normalize(tmpvec3, tmpvec3);
            quat.setAxisAngle(out, tmpvec3, Math.PI);
            return out;
        } else if (dot > 0.999999) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        } else {
            vec3.cross(tmpvec3, a, b);
            out[0] = tmpvec3[0];
            out[1] = tmpvec3[1];
            out[2] = tmpvec3[2];
            out[3] = 1 + dot;
            return quat.normalize(out, out);
        }
    };
})();

/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {vec3} view  the vector representing the viewing direction
 * @param {vec3} right the vector representing the local "right" direction
 * @param {vec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */
quat.setAxes = (function() {
    var matr = mat3.create();

    return function(out, view, right, up) {
        matr[0] = right[0];
        matr[3] = right[1];
        matr[6] = right[2];

        matr[1] = up[0];
        matr[4] = up[1];
        matr[7] = up[2];

        matr[2] = -view[0];
        matr[5] = -view[1];
        matr[8] = -view[2];

        return quat.normalize(out, quat.fromMat3(out, matr));
    };
})();

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */
quat.clone = vec4.clone;

/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */
quat.fromValues = vec4.fromValues;

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */
quat.copy = vec4.copy;

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
quat.set = vec4.set;

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
quat.identity = function(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
quat.setAxisAngle = function(out, axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
};

/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */
quat.add = vec4.add;

/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
quat.multiply = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
};

/**
 * Alias for {@link quat.multiply}
 * @function
 */
quat.mul = quat.multiply;

/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
quat.scale = vec4.scale;

/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateX = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
};

/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateY = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        by = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
};

/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateZ = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bz = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
};

/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */
quat.calculateW = function (out, a) {
    var x = a[0], y = a[1], z = a[2];

    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return out;
};

/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
quat.dot = vec4.dot;

/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 * @function
 */
quat.lerp = vec4.lerp;

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
quat.slerp = function (out, a, b, t) {
    // benchmarks:
    //    http://jsperf.com/quaternion-slerp-implementations

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    var        omega, cosom, sinom, scale0, scale1;

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if ( cosom < 0.0 ) {
        cosom = -cosom;
        bx = - bx;
        by = - by;
        bz = - bz;
        bw = - bw;
    }
    // calculate coefficients
    if ( (1.0 - cosom) > 0.000001 ) {
        // standard case (slerp)
        omega  = Math.acos(cosom);
        sinom  = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {        
        // "from" and "to" quaternions are very close 
        //  ... so we can do a linear interpolation
        scale0 = 1.0 - t;
        scale1 = t;
    }
    // calculate final values
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;
    
    return out;
};

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
quat.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
        invDot = dot ? 1.0/dot : 0;
    
    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    out[0] = -a0*invDot;
    out[1] = -a1*invDot;
    out[2] = -a2*invDot;
    out[3] = a3*invDot;
    return out;
};

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
quat.conjugate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
};

/**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 * @function
 */
quat.length = vec4.length;

/**
 * Alias for {@link quat.length}
 * @function
 */
quat.len = quat.length;

/**
 * Calculates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
quat.squaredLength = vec4.squaredLength;

/**
 * Alias for {@link quat.squaredLength}
 * @function
 */
quat.sqrLen = quat.squaredLength;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
quat.normalize = vec4.normalize;

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
quat.fromMat3 = function(out, m) {
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".
    var fTrace = m[0] + m[4] + m[8];
    var fRoot;

    if ( fTrace > 0.0 ) {
        // |w| > 1/2, may as well choose w > 1/2
        fRoot = Math.sqrt(fTrace + 1.0);  // 2w
        out[3] = 0.5 * fRoot;
        fRoot = 0.5/fRoot;  // 1/(4w)
        out[0] = (m[7]-m[5])*fRoot;
        out[1] = (m[2]-m[6])*fRoot;
        out[2] = (m[3]-m[1])*fRoot;
    } else {
        // |w| <= 1/2
        var i = 0;
        if ( m[4] > m[0] )
          i = 1;
        if ( m[8] > m[i*3+i] )
          i = 2;
        var j = (i+1)%3;
        var k = (i+2)%3;
        
        fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
        out[i] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot;
        out[3] = (m[k*3+j] - m[j*3+k]) * fRoot;
        out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
        out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
    }
    
    return out;
};

/**
 * Returns a string representation of a quatenion
 *
 * @param {quat} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
quat.str = function (a) {
    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.quat = quat;
}
;













  })(shim.exports);
})(this);

!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.poly2tri=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports={"version": "1.3.5"}
},{}],2:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 * 
 * All rights reserved.
 * 
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

/* jshint maxcomplexity:11 */

"use strict";


/*
 * Note
 * ====
 * the structure of this JavaScript version of poly2tri intentionally follows
 * as closely as possible the structure of the reference C++ version, to make it 
 * easier to keep the 2 versions in sync.
 */


// -------------------------------------------------------------------------Node

/**
 * Advancing front node
 * @constructor
 * @private
 * @struct
 * @param {!XY} p - Point
 * @param {Triangle=} t triangle (optional)
 */
var Node = function(p, t) {
    /** @type {XY} */
    this.point = p;

    /** @type {Triangle|null} */
    this.triangle = t || null;

    /** @type {Node|null} */
    this.next = null;
    /** @type {Node|null} */
    this.prev = null;

    /** @type {number} */
    this.value = p.x;
};

// ---------------------------------------------------------------AdvancingFront
/**
 * @constructor
 * @private
 * @struct
 * @param {Node} head
 * @param {Node} tail
 */
var AdvancingFront = function(head, tail) {
    /** @type {Node} */
    this.head_ = head;
    /** @type {Node} */
    this.tail_ = tail;
    /** @type {Node} */
    this.search_node_ = head;
};

/** @return {Node} */
AdvancingFront.prototype.head = function() {
    return this.head_;
};

/** @param {Node} node */
AdvancingFront.prototype.setHead = function(node) {
    this.head_ = node;
};

/** @return {Node} */
AdvancingFront.prototype.tail = function() {
    return this.tail_;
};

/** @param {Node} node */
AdvancingFront.prototype.setTail = function(node) {
    this.tail_ = node;
};

/** @return {Node} */
AdvancingFront.prototype.search = function() {
    return this.search_node_;
};

/** @param {Node} node */
AdvancingFront.prototype.setSearch = function(node) {
    this.search_node_ = node;
};

/** @return {Node} */
AdvancingFront.prototype.findSearchNode = function(/*x*/) {
    // TODO: implement BST index
    return this.search_node_;
};

/**
 * @param {number} x value
 * @return {Node}
 */
AdvancingFront.prototype.locateNode = function(x) {
    var node = this.search_node_;

    /* jshint boss:true */
    if (x < node.value) {
        while (node = node.prev) {
            if (x >= node.value) {
                this.search_node_ = node;
                return node;
            }
        }
    } else {
        while (node = node.next) {
            if (x < node.value) {
                this.search_node_ = node.prev;
                return node.prev;
            }
        }
    }
    return null;
};

/**
 * @param {!XY} point - Point
 * @return {Node}
 */
AdvancingFront.prototype.locatePoint = function(point) {
    var px = point.x;
    var node = this.findSearchNode(px);
    var nx = node.point.x;

    if (px === nx) {
        // Here we are comparing point references, not values
        if (point !== node.point) {
            // We might have two nodes with same x value for a short time
            if (point === node.prev.point) {
                node = node.prev;
            } else if (point === node.next.point) {
                node = node.next;
            } else {
                throw new Error('poly2tri Invalid AdvancingFront.locatePoint() call');
            }
        }
    } else if (px < nx) {
        /* jshint boss:true */
        while (node = node.prev) {
            if (point === node.point) {
                break;
            }
        }
    } else {
        while (node = node.next) {
            if (point === node.point) {
                break;
            }
        }
    }

    if (node) {
        this.search_node_ = node;
    }
    return node;
};


// ----------------------------------------------------------------------Exports

module.exports = AdvancingFront;
module.exports.Node = Node;


},{}],3:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 *
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 *
 * All rights reserved.
 *
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

"use strict";

/*
 * Function added in the JavaScript version (was not present in the c++ version)
 */

/**
 * assert and throw an exception.
 *
 * @private
 * @param {boolean} condition   the condition which is asserted
 * @param {string} message      the message which is display is condition is falsy
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assert Failed");
    }
}
module.exports = assert;



},{}],4:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 * 
 * All rights reserved.
 * 
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

"use strict";


/*
 * Note
 * ====
 * the structure of this JavaScript version of poly2tri intentionally follows
 * as closely as possible the structure of the reference C++ version, to make it 
 * easier to keep the 2 versions in sync.
 */

var xy = _dereq_('./xy');

// ------------------------------------------------------------------------Point
/**
 * Construct a point
 * @example
 *      var point = new poly2tri.Point(150, 150);
 * @public
 * @constructor
 * @struct
 * @param {number=} x    coordinate (0 if undefined)
 * @param {number=} y    coordinate (0 if undefined)
 */
var Point = function(x, y) {
    /**
     * @type {number}
     * @expose
     */
    this.x = +x || 0;
    /**
     * @type {number}
     * @expose
     */
    this.y = +y || 0;

    // All extra fields added to Point are prefixed with _p2t_
    // to avoid collisions if custom Point class is used.

    /**
     * The edges this point constitutes an upper ending point
     * @private
     * @type {Array.<Edge>}
     */
    this._p2t_edge_list = null;
};

/**
 * For pretty printing
 * @example
 *      "p=" + new poly2tri.Point(5,42)
 *      // → "p=(5;42)"
 * @returns {string} <code>"(x;y)"</code>
 */
Point.prototype.toString = function() {
    return xy.toStringBase(this);
};

/**
 * JSON output, only coordinates
 * @example
 *      JSON.stringify(new poly2tri.Point(1,2))
 *      // → '{"x":1,"y":2}'
 */
Point.prototype.toJSON = function() {
    return { x: this.x, y: this.y };
};

/**
 * Creates a copy of this Point object.
 * @return {Point} new cloned point
 */
Point.prototype.clone = function() {
    return new Point(this.x, this.y);
};

/**
 * Set this Point instance to the origo. <code>(0; 0)</code>
 * @return {Point} this (for chaining)
 */
Point.prototype.set_zero = function() {
    this.x = 0.0;
    this.y = 0.0;
    return this; // for chaining
};

/**
 * Set the coordinates of this instance.
 * @param {number} x   coordinate
 * @param {number} y   coordinate
 * @return {Point} this (for chaining)
 */
Point.prototype.set = function(x, y) {
    this.x = +x || 0;
    this.y = +y || 0;
    return this; // for chaining
};

/**
 * Negate this Point instance. (component-wise)
 * @return {Point} this (for chaining)
 */
Point.prototype.negate = function() {
    this.x = -this.x;
    this.y = -this.y;
    return this; // for chaining
};

/**
 * Add another Point object to this instance. (component-wise)
 * @param {!Point} n - Point object.
 * @return {Point} this (for chaining)
 */
Point.prototype.add = function(n) {
    this.x += n.x;
    this.y += n.y;
    return this; // for chaining
};

/**
 * Subtract this Point instance with another point given. (component-wise)
 * @param {!Point} n - Point object.
 * @return {Point} this (for chaining)
 */
Point.prototype.sub = function(n) {
    this.x -= n.x;
    this.y -= n.y;
    return this; // for chaining
};

/**
 * Multiply this Point instance by a scalar. (component-wise)
 * @param {number} s   scalar.
 * @return {Point} this (for chaining)
 */
Point.prototype.mul = function(s) {
    this.x *= s;
    this.y *= s;
    return this; // for chaining
};

/**
 * Return the distance of this Point instance from the origo.
 * @return {number} distance
 */
Point.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

/**
 * Normalize this Point instance (as a vector).
 * @return {number} The original distance of this instance from the origo.
 */
Point.prototype.normalize = function() {
    var len = this.length();
    this.x /= len;
    this.y /= len;
    return len;
};

/**
 * Test this Point object with another for equality.
 * @param {!XY} p - any "Point like" object with {x,y}
 * @return {boolean} <code>true</code> if same x and y coordinates, <code>false</code> otherwise.
 */
Point.prototype.equals = function(p) {
    return this.x === p.x && this.y === p.y;
};


// -----------------------------------------------------Point ("static" methods)

/**
 * Negate a point component-wise and return the result as a new Point object.
 * @param {!XY} p - any "Point like" object with {x,y}
 * @return {Point} the resulting Point object.
 */
Point.negate = function(p) {
    return new Point(-p.x, -p.y);
};

/**
 * Add two points component-wise and return the result as a new Point object.
 * @param {!XY} a - any "Point like" object with {x,y}
 * @param {!XY} b - any "Point like" object with {x,y}
 * @return {Point} the resulting Point object.
 */
Point.add = function(a, b) {
    return new Point(a.x + b.x, a.y + b.y);
};

/**
 * Subtract two points component-wise and return the result as a new Point object.
 * @param {!XY} a - any "Point like" object with {x,y}
 * @param {!XY} b - any "Point like" object with {x,y}
 * @return {Point} the resulting Point object.
 */
Point.sub = function(a, b) {
    return new Point(a.x - b.x, a.y - b.y);
};

/**
 * Multiply a point by a scalar and return the result as a new Point object.
 * @param {number} s - the scalar
 * @param {!XY} p - any "Point like" object with {x,y}
 * @return {Point} the resulting Point object.
 */
Point.mul = function(s, p) {
    return new Point(s * p.x, s * p.y);
};

/**
 * Perform the cross product on either two points (this produces a scalar)
 * or a point and a scalar (this produces a point).
 * This function requires two parameters, either may be a Point object or a
 * number.
 * @param  {XY|number} a - Point object or scalar.
 * @param  {XY|number} b - Point object or scalar.
 * @return {Point|number} a Point object or a number, depending on the parameters.
 */
Point.cross = function(a, b) {
    if (typeof(a) === 'number') {
        if (typeof(b) === 'number') {
            return a * b;
        } else {
            return new Point(-a * b.y, a * b.x);
        }
    } else {
        if (typeof(b) === 'number') {
            return new Point(b * a.y, -b * a.x);
        } else {
            return a.x * b.y - a.y * b.x;
        }
    }
};


// -----------------------------------------------------------------"Point-Like"
/*
 * The following functions operate on "Point" or any "Point like" object 
 * with {x,y} (duck typing).
 */

Point.toString = xy.toString;
Point.compare = xy.compare;
Point.cmp = xy.compare; // backward compatibility
Point.equals = xy.equals;

/**
 * Peform the dot product on two vectors.
 * @public
 * @param {!XY} a - any "Point like" object with {x,y}
 * @param {!XY} b - any "Point like" object with {x,y}
 * @return {number} The dot product
 */
Point.dot = function(a, b) {
    return a.x * b.x + a.y * b.y;
};


// ---------------------------------------------------------Exports (public API)

module.exports = Point;

},{"./xy":11}],5:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 * 
 * All rights reserved.
 * 
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

"use strict";

/*
 * Class added in the JavaScript version (was not present in the c++ version)
 */

var xy = _dereq_('./xy');

/**
 * Custom exception class to indicate invalid Point values
 * @constructor
 * @public
 * @extends Error
 * @struct
 * @param {string=} message - error message
 * @param {Array.<XY>=} points - invalid points
 */
var PointError = function(message, points) {
    this.name = "PointError";
    /**
     * Invalid points
     * @public
     * @type {Array.<XY>}
     */
    this.points = points = points || [];
    /**
     * Error message
     * @public
     * @type {string}
     */
    this.message = message || "Invalid Points!";
    for (var i = 0; i < points.length; i++) {
        this.message += " " + xy.toString(points[i]);
    }
};
PointError.prototype = new Error();
PointError.prototype.constructor = PointError;


module.exports = PointError;

},{"./xy":11}],6:[function(_dereq_,module,exports){
(function (global){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * * Neither the name of Poly2Tri nor the names of its contributors may be
 *   used to endorse or promote products derived from this software without specific
 *   prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

/**
 * Public API for poly2tri.js
 * @module poly2tri
 */


/**
 * If you are not using a module system (e.g. CommonJS, RequireJS), you can access this library
 * as a global variable <code>poly2tri</code> i.e. <code>window.poly2tri</code> in a browser.
 * @name poly2tri
 * @global
 * @public
 * @type {module:poly2tri}
 */
var previousPoly2tri = global.poly2tri;
/**
 * For Browser + &lt;script&gt; :
 * reverts the {@linkcode poly2tri} global object to its previous value,
 * and returns a reference to the instance called.
 *
 * @example
 *              var p = poly2tri.noConflict();
 * @public
 * @return {module:poly2tri} instance called
 */
// (this feature is not automatically provided by browserify).
exports.noConflict = function() {
    global.poly2tri = previousPoly2tri;
    return exports;
};

/**
 * poly2tri library version
 * @public
 * @const {string}
 */
exports.VERSION = _dereq_('../dist/version.json').version;

/**
 * Exports the {@linkcode PointError} class.
 * @public
 * @typedef {PointError} module:poly2tri.PointError
 * @function
 */
exports.PointError = _dereq_('./pointerror');
/**
 * Exports the {@linkcode Point} class.
 * @public
 * @typedef {Point} module:poly2tri.Point
 * @function
 */
exports.Point = _dereq_('./point');
/**
 * Exports the {@linkcode Triangle} class.
 * @public
 * @typedef {Triangle} module:poly2tri.Triangle
 * @function
 */
exports.Triangle = _dereq_('./triangle');
/**
 * Exports the {@linkcode SweepContext} class.
 * @public
 * @typedef {SweepContext} module:poly2tri.SweepContext
 * @function
 */
exports.SweepContext = _dereq_('./sweepcontext');


// Backward compatibility
var sweep = _dereq_('./sweep');
/**
 * @function
 * @deprecated use {@linkcode SweepContext#triangulate} instead
 */
exports.triangulate = sweep.triangulate;
/**
 * @deprecated use {@linkcode SweepContext#triangulate} instead
 * @property {function} Triangulate - use {@linkcode SweepContext#triangulate} instead
 */
exports.sweep = {Triangulate: sweep.triangulate};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../dist/version.json":1,"./point":4,"./pointerror":5,"./sweep":7,"./sweepcontext":8,"./triangle":9}],7:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 * 
 * All rights reserved.
 * 
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

/* jshint latedef:nofunc, maxcomplexity:9 */

"use strict";

/**
 * This 'Sweep' module is present in order to keep this JavaScript version
 * as close as possible to the reference C++ version, even though almost all
 * functions could be declared as methods on the {@linkcode module:sweepcontext~SweepContext} object.
 * @module
 * @private
 */

/*
 * Note
 * ====
 * the structure of this JavaScript version of poly2tri intentionally follows
 * as closely as possible the structure of the reference C++ version, to make it 
 * easier to keep the 2 versions in sync.
 */

var assert = _dereq_('./assert');
var PointError = _dereq_('./pointerror');
var Triangle = _dereq_('./triangle');
var Node = _dereq_('./advancingfront').Node;


// ------------------------------------------------------------------------utils

var utils = _dereq_('./utils');

/** @const */
var EPSILON = utils.EPSILON;

/** @const */
var Orientation = utils.Orientation;
/** @const */
var orient2d = utils.orient2d;
/** @const */
var inScanArea = utils.inScanArea;
/** @const */
var isAngleObtuse = utils.isAngleObtuse;


// ------------------------------------------------------------------------Sweep

/**
 * Triangulate the polygon with holes and Steiner points.
 * Do this AFTER you've added the polyline, holes, and Steiner points
 * @private
 * @param {!SweepContext} tcx - SweepContext object
 */
function triangulate(tcx) {
    tcx.initTriangulation();
    tcx.createAdvancingFront();
    // Sweep points; build mesh
    sweepPoints(tcx);
    // Clean up
    finalizationPolygon(tcx);
}

/**
 * Start sweeping the Y-sorted point set from bottom to top
 * @param {!SweepContext} tcx - SweepContext object
 */
function sweepPoints(tcx) {
    var i, len = tcx.pointCount();
    for (i = 1; i < len; ++i) {
        var point = tcx.getPoint(i);
        var node = pointEvent(tcx, point);
        var edges = point._p2t_edge_list;
        for (var j = 0; edges && j < edges.length; ++j) {
            edgeEventByEdge(tcx, edges[j], node);
        }
    }
}

/**
 * @param {!SweepContext} tcx - SweepContext object
 */
function finalizationPolygon(tcx) {
    // Get an Internal triangle to start with
    var t = tcx.front().head().next.triangle;
    var p = tcx.front().head().next.point;
    while (!t.getConstrainedEdgeCW(p)) {
        t = t.neighborCCW(p);
    }

    // Collect interior triangles constrained by edges
    tcx.meshClean(t);
}

/**
 * Find closes node to the left of the new point and
 * create a new triangle. If needed new holes and basins
 * will be filled to.
 * @param {!SweepContext} tcx - SweepContext object
 * @param {!XY} point   Point
 */
function pointEvent(tcx, point) {
    var node = tcx.locateNode(point);
    var new_node = newFrontTriangle(tcx, point, node);

    // Only need to check +epsilon since point never have smaller
    // x value than node due to how we fetch nodes from the front
    if (point.x <= node.point.x + (EPSILON)) {
        fill(tcx, node);
    }

    //tcx.AddNode(new_node);

    fillAdvancingFront(tcx, new_node);
    return new_node;
}

function edgeEventByEdge(tcx, edge, node) {
    tcx.edge_event.constrained_edge = edge;
    tcx.edge_event.right = (edge.p.x > edge.q.x);

    if (isEdgeSideOfTriangle(node.triangle, edge.p, edge.q)) {
        return;
    }

    // For now we will do all needed filling
    // TODO: integrate with flip process might give some better performance
    //       but for now this avoid the issue with cases that needs both flips and fills
    fillEdgeEvent(tcx, edge, node);
    edgeEventByPoints(tcx, edge.p, edge.q, node.triangle, edge.q);
}

function edgeEventByPoints(tcx, ep, eq, triangle, point) {
    if (isEdgeSideOfTriangle(triangle, ep, eq)) {
        return;
    }

    var p1 = triangle.pointCCW(point);
    var o1 = orient2d(eq, p1, ep);
    if (o1 === Orientation.COLLINEAR) {
        // TODO integrate here changes from C++ version
        // (C++ repo revision 09880a869095 dated March 8, 2011)
        throw new PointError('poly2tri EdgeEvent: Collinear not supported!', [eq, p1, ep]);
    }

    var p2 = triangle.pointCW(point);
    var o2 = orient2d(eq, p2, ep);
    if (o2 === Orientation.COLLINEAR) {
        // TODO integrate here changes from C++ version
        // (C++ repo revision 09880a869095 dated March 8, 2011)
        throw new PointError('poly2tri EdgeEvent: Collinear not supported!', [eq, p2, ep]);
    }

    if (o1 === o2) {
        // Need to decide if we are rotating CW or CCW to get to a triangle
        // that will cross edge
        if (o1 === Orientation.CW) {
            triangle = triangle.neighborCCW(point);
        } else {
            triangle = triangle.neighborCW(point);
        }
        edgeEventByPoints(tcx, ep, eq, triangle, point);
    } else {
        // This triangle crosses constraint so lets flippin start!
        flipEdgeEvent(tcx, ep, eq, triangle, point);
    }
}

function isEdgeSideOfTriangle(triangle, ep, eq) {
    var index = triangle.edgeIndex(ep, eq);
    if (index !== -1) {
        triangle.markConstrainedEdgeByIndex(index);
        var t = triangle.getNeighbor(index);
        if (t) {
            t.markConstrainedEdgeByPoints(ep, eq);
        }
        return true;
    }
    return false;
}

/**
 * Creates a new front triangle and legalize it
 * @param {!SweepContext} tcx - SweepContext object
 */
function newFrontTriangle(tcx, point, node) {
    var triangle = new Triangle(point, node.point, node.next.point);

    triangle.markNeighbor(node.triangle);
    tcx.addToMap(triangle);

    var new_node = new Node(point);
    new_node.next = node.next;
    new_node.prev = node;
    node.next.prev = new_node;
    node.next = new_node;

    if (!legalize(tcx, triangle)) {
        tcx.mapTriangleToNodes(triangle);
    }

    return new_node;
}

/**
 * Adds a triangle to the advancing front to fill a hole.
 * @param {!SweepContext} tcx - SweepContext object
 * @param node - middle node, that is the bottom of the hole
 */
function fill(tcx, node) {
    var triangle = new Triangle(node.prev.point, node.point, node.next.point);

    // TODO: should copy the constrained_edge value from neighbor triangles
    //       for now constrained_edge values are copied during the legalize
    triangle.markNeighbor(node.prev.triangle);
    triangle.markNeighbor(node.triangle);

    tcx.addToMap(triangle);

    // Update the advancing front
    node.prev.next = node.next;
    node.next.prev = node.prev;


    // If it was legalized the triangle has already been mapped
    if (!legalize(tcx, triangle)) {
        tcx.mapTriangleToNodes(triangle);
    }

    //tcx.removeNode(node);
}

/**
 * Fills holes in the Advancing Front
 * @param {!SweepContext} tcx - SweepContext object
 */
function fillAdvancingFront(tcx, n) {
    // Fill right holes
    var node = n.next;
    while (node.next) {
        // TODO integrate here changes from C++ version
        // (C++ repo revision acf81f1f1764 dated April 7, 2012)
        if (isAngleObtuse(node.point, node.next.point, node.prev.point)) {
            break;
        }
        fill(tcx, node);
        node = node.next;
    }

    // Fill left holes
    node = n.prev;
    while (node.prev) {
        // TODO integrate here changes from C++ version
        // (C++ repo revision acf81f1f1764 dated April 7, 2012)
        if (isAngleObtuse(node.point, node.next.point, node.prev.point)) {
            break;
        }
        fill(tcx, node);
        node = node.prev;
    }

    // Fill right basins
    if (n.next && n.next.next) {
        if (isBasinAngleRight(n)) {
            fillBasin(tcx, n);
        }
    }
}

/**
 * The basin angle is decided against the horizontal line [1,0].
 * @param {Node} node
 * @return {boolean} true if angle < 3*π/4
 */
function isBasinAngleRight(node) {
    var ax = node.point.x - node.next.next.point.x;
    var ay = node.point.y - node.next.next.point.y;
    assert(ay >= 0, "unordered y");
    return (ax >= 0 || Math.abs(ax) < ay);
}

/**
 * Returns true if triangle was legalized
 * @param {!SweepContext} tcx - SweepContext object
 * @return {boolean}
 */
function legalize(tcx, t) {
    // To legalize a triangle we start by finding if any of the three edges
    // violate the Delaunay condition
    for (var i = 0; i < 3; ++i) {
        if (t.delaunay_edge[i]) {
            continue;
        }
        var ot = t.getNeighbor(i);
        if (ot) {
            var p = t.getPoint(i);
            var op = ot.oppositePoint(t, p);
            var oi = ot.index(op);

            // If this is a Constrained Edge or a Delaunay Edge(only during recursive legalization)
            // then we should not try to legalize
            if (ot.constrained_edge[oi] || ot.delaunay_edge[oi]) {
                t.constrained_edge[i] = ot.constrained_edge[oi];
                continue;
            }

            var inside = inCircle(p, t.pointCCW(p), t.pointCW(p), op);
            if (inside) {
                // Lets mark this shared edge as Delaunay
                t.delaunay_edge[i] = true;
                ot.delaunay_edge[oi] = true;

                // Lets rotate shared edge one vertex CW to legalize it
                rotateTrianglePair(t, p, ot, op);

                // We now got one valid Delaunay Edge shared by two triangles
                // This gives us 4 new edges to check for Delaunay

                // Make sure that triangle to node mapping is done only one time for a specific triangle
                var not_legalized = !legalize(tcx, t);
                if (not_legalized) {
                    tcx.mapTriangleToNodes(t);
                }

                not_legalized = !legalize(tcx, ot);
                if (not_legalized) {
                    tcx.mapTriangleToNodes(ot);
                }
                // Reset the Delaunay edges, since they only are valid Delaunay edges
                // until we add a new triangle or point.
                // XXX: need to think about this. Can these edges be tried after we
                //      return to previous recursive level?
                t.delaunay_edge[i] = false;
                ot.delaunay_edge[oi] = false;

                // If triangle have been legalized no need to check the other edges since
                // the recursive legalization will handles those so we can end here.
                return true;
            }
        }
    }
    return false;
}

/**
 * <b>Requirement</b>:<br>
 * 1. a,b and c form a triangle.<br>
 * 2. a and d is know to be on opposite side of bc<br>
 * <pre>
 *                a
 *                +
 *               / \
 *              /   \
 *            b/     \c
 *            +-------+
 *           /    d    \
 *          /           \
 * </pre>
 * <b>Fact</b>: d has to be in area B to have a chance to be inside the circle formed by
 *  a,b and c<br>
 *  d is outside B if orient2d(a,b,d) or orient2d(c,a,d) is CW<br>
 *  This preknowledge gives us a way to optimize the incircle test
 * @param pa - triangle point, opposite d
 * @param pb - triangle point
 * @param pc - triangle point
 * @param pd - point opposite a
 * @return {boolean} true if d is inside circle, false if on circle edge
 */
function inCircle(pa, pb, pc, pd) {
    var adx = pa.x - pd.x;
    var ady = pa.y - pd.y;
    var bdx = pb.x - pd.x;
    var bdy = pb.y - pd.y;

    var adxbdy = adx * bdy;
    var bdxady = bdx * ady;
    var oabd = adxbdy - bdxady;
    if (oabd <= 0) {
        return false;
    }

    var cdx = pc.x - pd.x;
    var cdy = pc.y - pd.y;

    var cdxady = cdx * ady;
    var adxcdy = adx * cdy;
    var ocad = cdxady - adxcdy;
    if (ocad <= 0) {
        return false;
    }

    var bdxcdy = bdx * cdy;
    var cdxbdy = cdx * bdy;

    var alift = adx * adx + ady * ady;
    var blift = bdx * bdx + bdy * bdy;
    var clift = cdx * cdx + cdy * cdy;

    var det = alift * (bdxcdy - cdxbdy) + blift * ocad + clift * oabd;
    return det > 0;
}

/**
 * Rotates a triangle pair one vertex CW
 *<pre>
 *       n2                    n2
 *  P +-----+             P +-----+
 *    | t  /|               |\  t |
 *    |   / |               | \   |
 *  n1|  /  |n3           n1|  \  |n3
 *    | /   |    after CW   |   \ |
 *    |/ oT |               | oT \|
 *    +-----+ oP            +-----+
 *       n4                    n4
 * </pre>
 */
function rotateTrianglePair(t, p, ot, op) {
    var n1, n2, n3, n4;
    n1 = t.neighborCCW(p);
    n2 = t.neighborCW(p);
    n3 = ot.neighborCCW(op);
    n4 = ot.neighborCW(op);

    var ce1, ce2, ce3, ce4;
    ce1 = t.getConstrainedEdgeCCW(p);
    ce2 = t.getConstrainedEdgeCW(p);
    ce3 = ot.getConstrainedEdgeCCW(op);
    ce4 = ot.getConstrainedEdgeCW(op);

    var de1, de2, de3, de4;
    de1 = t.getDelaunayEdgeCCW(p);
    de2 = t.getDelaunayEdgeCW(p);
    de3 = ot.getDelaunayEdgeCCW(op);
    de4 = ot.getDelaunayEdgeCW(op);

    t.legalize(p, op);
    ot.legalize(op, p);

    // Remap delaunay_edge
    ot.setDelaunayEdgeCCW(p, de1);
    t.setDelaunayEdgeCW(p, de2);
    t.setDelaunayEdgeCCW(op, de3);
    ot.setDelaunayEdgeCW(op, de4);

    // Remap constrained_edge
    ot.setConstrainedEdgeCCW(p, ce1);
    t.setConstrainedEdgeCW(p, ce2);
    t.setConstrainedEdgeCCW(op, ce3);
    ot.setConstrainedEdgeCW(op, ce4);

    // Remap neighbors
    // XXX: might optimize the markNeighbor by keeping track of
    //      what side should be assigned to what neighbor after the
    //      rotation. Now mark neighbor does lots of testing to find
    //      the right side.
    t.clearNeighbors();
    ot.clearNeighbors();
    if (n1) {
        ot.markNeighbor(n1);
    }
    if (n2) {
        t.markNeighbor(n2);
    }
    if (n3) {
        t.markNeighbor(n3);
    }
    if (n4) {
        ot.markNeighbor(n4);
    }
    t.markNeighbor(ot);
}

/**
 * Fills a basin that has formed on the Advancing Front to the right
 * of given node.<br>
 * First we decide a left,bottom and right node that forms the
 * boundaries of the basin. Then we do a reqursive fill.
 *
 * @param {!SweepContext} tcx - SweepContext object
 * @param node - starting node, this or next node will be left node
 */
function fillBasin(tcx, node) {
    if (orient2d(node.point, node.next.point, node.next.next.point) === Orientation.CCW) {
        tcx.basin.left_node = node.next.next;
    } else {
        tcx.basin.left_node = node.next;
    }

    // Find the bottom and right node
    tcx.basin.bottom_node = tcx.basin.left_node;
    while (tcx.basin.bottom_node.next && tcx.basin.bottom_node.point.y >= tcx.basin.bottom_node.next.point.y) {
        tcx.basin.bottom_node = tcx.basin.bottom_node.next;
    }
    if (tcx.basin.bottom_node === tcx.basin.left_node) {
        // No valid basin
        return;
    }

    tcx.basin.right_node = tcx.basin.bottom_node;
    while (tcx.basin.right_node.next && tcx.basin.right_node.point.y < tcx.basin.right_node.next.point.y) {
        tcx.basin.right_node = tcx.basin.right_node.next;
    }
    if (tcx.basin.right_node === tcx.basin.bottom_node) {
        // No valid basins
        return;
    }

    tcx.basin.width = tcx.basin.right_node.point.x - tcx.basin.left_node.point.x;
    tcx.basin.left_highest = tcx.basin.left_node.point.y > tcx.basin.right_node.point.y;

    fillBasinReq(tcx, tcx.basin.bottom_node);
}

/**
 * Recursive algorithm to fill a Basin with triangles
 *
 * @param {!SweepContext} tcx - SweepContext object
 * @param node - bottom_node
 */
function fillBasinReq(tcx, node) {
    // if shallow stop filling
    if (isShallow(tcx, node)) {
        return;
    }

    fill(tcx, node);

    var o;
    if (node.prev === tcx.basin.left_node && node.next === tcx.basin.right_node) {
        return;
    } else if (node.prev === tcx.basin.left_node) {
        o = orient2d(node.point, node.next.point, node.next.next.point);
        if (o === Orientation.CW) {
            return;
        }
        node = node.next;
    } else if (node.next === tcx.basin.right_node) {
        o = orient2d(node.point, node.prev.point, node.prev.prev.point);
        if (o === Orientation.CCW) {
            return;
        }
        node = node.prev;
    } else {
        // Continue with the neighbor node with lowest Y value
        if (node.prev.point.y < node.next.point.y) {
            node = node.prev;
        } else {
            node = node.next;
        }
    }

    fillBasinReq(tcx, node);
}

function isShallow(tcx, node) {
    var height;
    if (tcx.basin.left_highest) {
        height = tcx.basin.left_node.point.y - node.point.y;
    } else {
        height = tcx.basin.right_node.point.y - node.point.y;
    }

    // if shallow stop filling
    if (tcx.basin.width > height) {
        return true;
    }
    return false;
}

function fillEdgeEvent(tcx, edge, node) {
    if (tcx.edge_event.right) {
        fillRightAboveEdgeEvent(tcx, edge, node);
    } else {
        fillLeftAboveEdgeEvent(tcx, edge, node);
    }
}

function fillRightAboveEdgeEvent(tcx, edge, node) {
    while (node.next.point.x < edge.p.x) {
        // Check if next node is below the edge
        if (orient2d(edge.q, node.next.point, edge.p) === Orientation.CCW) {
            fillRightBelowEdgeEvent(tcx, edge, node);
        } else {
            node = node.next;
        }
    }
}

function fillRightBelowEdgeEvent(tcx, edge, node) {
    if (node.point.x < edge.p.x) {
        if (orient2d(node.point, node.next.point, node.next.next.point) === Orientation.CCW) {
            // Concave
            fillRightConcaveEdgeEvent(tcx, edge, node);
        } else {
            // Convex
            fillRightConvexEdgeEvent(tcx, edge, node);
            // Retry this one
            fillRightBelowEdgeEvent(tcx, edge, node);
        }
    }
}

function fillRightConcaveEdgeEvent(tcx, edge, node) {
    fill(tcx, node.next);
    if (node.next.point !== edge.p) {
        // Next above or below edge?
        if (orient2d(edge.q, node.next.point, edge.p) === Orientation.CCW) {
            // Below
            if (orient2d(node.point, node.next.point, node.next.next.point) === Orientation.CCW) {
                // Next is concave
                fillRightConcaveEdgeEvent(tcx, edge, node);
            } else {
                // Next is convex
                /* jshint noempty:false */
            }
        }
    }
}

function fillRightConvexEdgeEvent(tcx, edge, node) {
    // Next concave or convex?
    if (orient2d(node.next.point, node.next.next.point, node.next.next.next.point) === Orientation.CCW) {
        // Concave
        fillRightConcaveEdgeEvent(tcx, edge, node.next);
    } else {
        // Convex
        // Next above or below edge?
        if (orient2d(edge.q, node.next.next.point, edge.p) === Orientation.CCW) {
            // Below
            fillRightConvexEdgeEvent(tcx, edge, node.next);
        } else {
            // Above
            /* jshint noempty:false */
        }
    }
}

function fillLeftAboveEdgeEvent(tcx, edge, node) {
    while (node.prev.point.x > edge.p.x) {
        // Check if next node is below the edge
        if (orient2d(edge.q, node.prev.point, edge.p) === Orientation.CW) {
            fillLeftBelowEdgeEvent(tcx, edge, node);
        } else {
            node = node.prev;
        }
    }
}

function fillLeftBelowEdgeEvent(tcx, edge, node) {
    if (node.point.x > edge.p.x) {
        if (orient2d(node.point, node.prev.point, node.prev.prev.point) === Orientation.CW) {
            // Concave
            fillLeftConcaveEdgeEvent(tcx, edge, node);
        } else {
            // Convex
            fillLeftConvexEdgeEvent(tcx, edge, node);
            // Retry this one
            fillLeftBelowEdgeEvent(tcx, edge, node);
        }
    }
}

function fillLeftConvexEdgeEvent(tcx, edge, node) {
    // Next concave or convex?
    if (orient2d(node.prev.point, node.prev.prev.point, node.prev.prev.prev.point) === Orientation.CW) {
        // Concave
        fillLeftConcaveEdgeEvent(tcx, edge, node.prev);
    } else {
        // Convex
        // Next above or below edge?
        if (orient2d(edge.q, node.prev.prev.point, edge.p) === Orientation.CW) {
            // Below
            fillLeftConvexEdgeEvent(tcx, edge, node.prev);
        } else {
            // Above
            /* jshint noempty:false */
        }
    }
}

function fillLeftConcaveEdgeEvent(tcx, edge, node) {
    fill(tcx, node.prev);
    if (node.prev.point !== edge.p) {
        // Next above or below edge?
        if (orient2d(edge.q, node.prev.point, edge.p) === Orientation.CW) {
            // Below
            if (orient2d(node.point, node.prev.point, node.prev.prev.point) === Orientation.CW) {
                // Next is concave
                fillLeftConcaveEdgeEvent(tcx, edge, node);
            } else {
                // Next is convex
                /* jshint noempty:false */
            }
        }
    }
}

function flipEdgeEvent(tcx, ep, eq, t, p) {
    var ot = t.neighborAcross(p);
    assert(ot, "FLIP failed due to missing triangle!");

    var op = ot.oppositePoint(t, p);

    // Additional check from Java version (see issue #88)
    if (t.getConstrainedEdgeAcross(p)) {
        var index = t.index(p);
        throw new PointError("poly2tri Intersecting Constraints",
                [p, op, t.getPoint((index + 1) % 3), t.getPoint((index + 2) % 3)]);
    }

    if (inScanArea(p, t.pointCCW(p), t.pointCW(p), op)) {
        // Lets rotate shared edge one vertex CW
        rotateTrianglePair(t, p, ot, op);
        tcx.mapTriangleToNodes(t);
        tcx.mapTriangleToNodes(ot);

        // XXX: in the original C++ code for the next 2 lines, we are
        // comparing point values (and not pointers). In this JavaScript
        // code, we are comparing point references (pointers). This works
        // because we can't have 2 different points with the same values.
        // But to be really equivalent, we should use "Point.equals" here.
        if (p === eq && op === ep) {
            if (eq === tcx.edge_event.constrained_edge.q && ep === tcx.edge_event.constrained_edge.p) {
                t.markConstrainedEdgeByPoints(ep, eq);
                ot.markConstrainedEdgeByPoints(ep, eq);
                legalize(tcx, t);
                legalize(tcx, ot);
            } else {
                // XXX: I think one of the triangles should be legalized here?
                /* jshint noempty:false */
            }
        } else {
            var o = orient2d(eq, op, ep);
            t = nextFlipTriangle(tcx, o, t, ot, p, op);
            flipEdgeEvent(tcx, ep, eq, t, p);
        }
    } else {
        var newP = nextFlipPoint(ep, eq, ot, op);
        flipScanEdgeEvent(tcx, ep, eq, t, ot, newP);
        edgeEventByPoints(tcx, ep, eq, t, p);
    }
}

/**
 * After a flip we have two triangles and know that only one will still be
 * intersecting the edge. So decide which to contiune with and legalize the other
 *
 * @param {!SweepContext} tcx - SweepContext object
 * @param o - should be the result of an orient2d( eq, op, ep )
 * @param t - triangle 1
 * @param ot - triangle 2
 * @param p - a point shared by both triangles
 * @param op - another point shared by both triangles
 * @return returns the triangle still intersecting the edge
 */
function nextFlipTriangle(tcx, o, t, ot, p, op) {
    var edge_index;
    if (o === Orientation.CCW) {
        // ot is not crossing edge after flip
        edge_index = ot.edgeIndex(p, op);
        ot.delaunay_edge[edge_index] = true;
        legalize(tcx, ot);
        ot.clearDelaunayEdges();
        return t;
    }

    // t is not crossing edge after flip
    edge_index = t.edgeIndex(p, op);

    t.delaunay_edge[edge_index] = true;
    legalize(tcx, t);
    t.clearDelaunayEdges();
    return ot;
}

/**
 * When we need to traverse from one triangle to the next we need
 * the point in current triangle that is the opposite point to the next
 * triangle.
 */
function nextFlipPoint(ep, eq, ot, op) {
    var o2d = orient2d(eq, op, ep);
    if (o2d === Orientation.CW) {
        // Right
        return ot.pointCCW(op);
    } else if (o2d === Orientation.CCW) {
        // Left
        return ot.pointCW(op);
    } else {
        throw new PointError("poly2tri [Unsupported] nextFlipPoint: opposing point on constrained edge!", [eq, op, ep]);
    }
}

/**
 * Scan part of the FlipScan algorithm<br>
 * When a triangle pair isn't flippable we will scan for the next
 * point that is inside the flip triangle scan area. When found
 * we generate a new flipEdgeEvent
 *
 * @param {!SweepContext} tcx - SweepContext object
 * @param ep - last point on the edge we are traversing
 * @param eq - first point on the edge we are traversing
 * @param {!Triangle} flip_triangle - the current triangle sharing the point eq with edge
 * @param t
 * @param p
 */
function flipScanEdgeEvent(tcx, ep, eq, flip_triangle, t, p) {
    var ot = t.neighborAcross(p);
    assert(ot, "FLIP failed due to missing triangle");

    var op = ot.oppositePoint(t, p);

    if (inScanArea(eq, flip_triangle.pointCCW(eq), flip_triangle.pointCW(eq), op)) {
        // flip with new edge op.eq
        flipEdgeEvent(tcx, eq, op, ot, op);
    } else {
        var newP = nextFlipPoint(ep, eq, ot, op);
        flipScanEdgeEvent(tcx, ep, eq, flip_triangle, ot, newP);
    }
}


// ----------------------------------------------------------------------Exports

exports.triangulate = triangulate;

},{"./advancingfront":2,"./assert":3,"./pointerror":5,"./triangle":9,"./utils":10}],8:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 * 
 * All rights reserved.
 * 
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

/* jshint maxcomplexity:6 */

"use strict";


/*
 * Note
 * ====
 * the structure of this JavaScript version of poly2tri intentionally follows
 * as closely as possible the structure of the reference C++ version, to make it 
 * easier to keep the 2 versions in sync.
 */

var PointError = _dereq_('./pointerror');
var Point = _dereq_('./point');
var Triangle = _dereq_('./triangle');
var sweep = _dereq_('./sweep');
var AdvancingFront = _dereq_('./advancingfront');
var Node = AdvancingFront.Node;


// ------------------------------------------------------------------------utils

/**
 * Initial triangle factor, seed triangle will extend 30% of
 * PointSet width to both left and right.
 * @private
 * @const
 */
var kAlpha = 0.3;


// -------------------------------------------------------------------------Edge
/**
 * Represents a simple polygon's edge
 * @constructor
 * @struct
 * @private
 * @param {Point} p1
 * @param {Point} p2
 * @throw {PointError} if p1 is same as p2
 */
var Edge = function(p1, p2) {
    this.p = p1;
    this.q = p2;

    if (p1.y > p2.y) {
        this.q = p1;
        this.p = p2;
    } else if (p1.y === p2.y) {
        if (p1.x > p2.x) {
            this.q = p1;
            this.p = p2;
        } else if (p1.x === p2.x) {
            throw new PointError('poly2tri Invalid Edge constructor: repeated points!', [p1]);
        }
    }

    if (!this.q._p2t_edge_list) {
        this.q._p2t_edge_list = [];
    }
    this.q._p2t_edge_list.push(this);
};


// ------------------------------------------------------------------------Basin
/**
 * @constructor
 * @struct
 * @private
 */
var Basin = function() {
    /** @type {Node} */
    this.left_node = null;
    /** @type {Node} */
    this.bottom_node = null;
    /** @type {Node} */
    this.right_node = null;
    /** @type {number} */
    this.width = 0.0;
    /** @type {boolean} */
    this.left_highest = false;
};

Basin.prototype.clear = function() {
    this.left_node = null;
    this.bottom_node = null;
    this.right_node = null;
    this.width = 0.0;
    this.left_highest = false;
};

// --------------------------------------------------------------------EdgeEvent
/**
 * @constructor
 * @struct
 * @private
 */
var EdgeEvent = function() {
    /** @type {Edge} */
    this.constrained_edge = null;
    /** @type {boolean} */
    this.right = false;
};

// ----------------------------------------------------SweepContext (public API)
/**
 * SweepContext constructor option
 * @typedef {Object} SweepContextOptions
 * @property {boolean=} cloneArrays - if <code>true</code>, do a shallow copy of the Array parameters
 *                  (contour, holes). Points inside arrays are never copied.
 *                  Default is <code>false</code> : keep a reference to the array arguments,
 *                  who will be modified in place.
 */
/**
 * Constructor for the triangulation context.
 * It accepts a simple polyline (with non repeating points), 
 * which defines the constrained edges.
 *
 * @example
 *          var contour = [
 *              new poly2tri.Point(100, 100),
 *              new poly2tri.Point(100, 300),
 *              new poly2tri.Point(300, 300),
 *              new poly2tri.Point(300, 100)
 *          ];
 *          var swctx = new poly2tri.SweepContext(contour, {cloneArrays: true});
 * @example
 *          var contour = [{x:100, y:100}, {x:100, y:300}, {x:300, y:300}, {x:300, y:100}];
 *          var swctx = new poly2tri.SweepContext(contour, {cloneArrays: true});
 * @constructor
 * @public
 * @struct
 * @param {Array.<XY>} contour - array of point objects. The points can be either {@linkcode Point} instances,
 *          or any "Point like" custom class with <code>{x, y}</code> attributes.
 * @param {SweepContextOptions=} options - constructor options
 */
var SweepContext = function(contour, options) {
    options = options || {};
    this.triangles_ = [];
    this.map_ = [];
    this.points_ = (options.cloneArrays ? contour.slice(0) : contour);
    this.edge_list = [];

    // Bounding box of all points. Computed at the start of the triangulation, 
    // it is stored in case it is needed by the caller.
    this.pmin_ = this.pmax_ = null;

    /**
     * Advancing front
     * @private
     * @type {AdvancingFront}
     */
    this.front_ = null;

    /**
     * head point used with advancing front
     * @private
     * @type {Point}
     */
    this.head_ = null;

    /**
     * tail point used with advancing front
     * @private
     * @type {Point}
     */
    this.tail_ = null;

    /**
     * @private
     * @type {Node}
     */
    this.af_head_ = null;
    /**
     * @private
     * @type {Node}
     */
    this.af_middle_ = null;
    /**
     * @private
     * @type {Node}
     */
    this.af_tail_ = null;

    this.basin = new Basin();
    this.edge_event = new EdgeEvent();

    this.initEdges(this.points_);
};


/**
 * Add a hole to the constraints
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      var hole = [
 *          new poly2tri.Point(200, 200),
 *          new poly2tri.Point(200, 250),
 *          new poly2tri.Point(250, 250)
 *      ];
 *      swctx.addHole(hole);
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.addHole([{x:200, y:200}, {x:200, y:250}, {x:250, y:250}]);
 * @public
 * @param {Array.<XY>} polyline - array of "Point like" objects with {x,y}
 */
SweepContext.prototype.addHole = function(polyline) {
    this.initEdges(polyline);
    var i, len = polyline.length;
    for (i = 0; i < len; i++) {
        this.points_.push(polyline[i]);
    }
    return this; // for chaining
};

/**
 * For backward compatibility
 * @function
 * @deprecated use {@linkcode SweepContext#addHole} instead
 */
SweepContext.prototype.AddHole = SweepContext.prototype.addHole;


/**
 * Add several holes to the constraints
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      var holes = [
 *          [ new poly2tri.Point(200, 200), new poly2tri.Point(200, 250), new poly2tri.Point(250, 250) ],
 *          [ new poly2tri.Point(300, 300), new poly2tri.Point(300, 350), new poly2tri.Point(350, 350) ]
 *      ];
 *      swctx.addHoles(holes);
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      var holes = [
 *          [{x:200, y:200}, {x:200, y:250}, {x:250, y:250}],
 *          [{x:300, y:300}, {x:300, y:350}, {x:350, y:350}]
 *      ];
 *      swctx.addHoles(holes);
 * @public
 * @param {Array.<Array.<XY>>} holes - array of array of "Point like" objects with {x,y}
 */
// Method added in the JavaScript version (was not present in the c++ version)
SweepContext.prototype.addHoles = function(holes) {
    var i, len = holes.length;
    for (i = 0; i < len; i++) {
        this.initEdges(holes[i]);
    }
    this.points_ = this.points_.concat.apply(this.points_, holes);
    return this; // for chaining
};


/**
 * Add a Steiner point to the constraints
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      var point = new poly2tri.Point(150, 150);
 *      swctx.addPoint(point);
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.addPoint({x:150, y:150});
 * @public
 * @param {XY} point - any "Point like" object with {x,y}
 */
SweepContext.prototype.addPoint = function(point) {
    this.points_.push(point);
    return this; // for chaining
};

/**
 * For backward compatibility
 * @function
 * @deprecated use {@linkcode SweepContext#addPoint} instead
 */
SweepContext.prototype.AddPoint = SweepContext.prototype.addPoint;


/**
 * Add several Steiner points to the constraints
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      var points = [
 *          new poly2tri.Point(150, 150),
 *          new poly2tri.Point(200, 250),
 *          new poly2tri.Point(250, 250)
 *      ];
 *      swctx.addPoints(points);
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.addPoints([{x:150, y:150}, {x:200, y:250}, {x:250, y:250}]);
 * @public
 * @param {Array.<XY>} points - array of "Point like" object with {x,y}
 */
// Method added in the JavaScript version (was not present in the c++ version)
SweepContext.prototype.addPoints = function(points) {
    this.points_ = this.points_.concat(points);
    return this; // for chaining
};


/**
 * Triangulate the polygon with holes and Steiner points.
 * Do this AFTER you've added the polyline, holes, and Steiner points
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.triangulate();
 *      var triangles = swctx.getTriangles();
 * @public
 */
// Shortcut method for sweep.triangulate(SweepContext).
// Method added in the JavaScript version (was not present in the c++ version)
SweepContext.prototype.triangulate = function() {
    sweep.triangulate(this);
    return this; // for chaining
};


/**
 * Get the bounding box of the provided constraints (contour, holes and 
 * Steinter points). Warning : these values are not available if the triangulation 
 * has not been done yet.
 * @public
 * @returns {{min:Point,max:Point}} object with 'min' and 'max' Point
 */
// Method added in the JavaScript version (was not present in the c++ version)
SweepContext.prototype.getBoundingBox = function() {
    return {min: this.pmin_, max: this.pmax_};
};

/**
 * Get result of triangulation.
 * The output triangles have vertices which are references
 * to the initial input points (not copies): any custom fields in the
 * initial points can be retrieved in the output triangles.
 * @example
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.triangulate();
 *      var triangles = swctx.getTriangles();
 * @example
 *      var contour = [{x:100, y:100, id:1}, {x:100, y:300, id:2}, {x:300, y:300, id:3}];
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.triangulate();
 *      var triangles = swctx.getTriangles();
 *      typeof triangles[0].getPoint(0).id
 *      // → "number"
 * @public
 * @returns {array<Triangle>}   array of triangles
 */
SweepContext.prototype.getTriangles = function() {
    return this.triangles_;
};

/**
 * For backward compatibility
 * @function
 * @deprecated use {@linkcode SweepContext#getTriangles} instead
 */
SweepContext.prototype.GetTriangles = SweepContext.prototype.getTriangles;


// ---------------------------------------------------SweepContext (private API)

/** @private */
SweepContext.prototype.front = function() {
    return this.front_;
};

/** @private */
SweepContext.prototype.pointCount = function() {
    return this.points_.length;
};

/** @private */
SweepContext.prototype.head = function() {
    return this.head_;
};

/** @private */
SweepContext.prototype.setHead = function(p1) {
    this.head_ = p1;
};

/** @private */
SweepContext.prototype.tail = function() {
    return this.tail_;
};

/** @private */
SweepContext.prototype.setTail = function(p1) {
    this.tail_ = p1;
};

/** @private */
SweepContext.prototype.getMap = function() {
    return this.map_;
};

/** @private */
SweepContext.prototype.initTriangulation = function() {
    var xmax = this.points_[0].x;
    var xmin = this.points_[0].x;
    var ymax = this.points_[0].y;
    var ymin = this.points_[0].y;

    // Calculate bounds
    var i, len = this.points_.length;
    for (i = 1; i < len; i++) {
        var p = this.points_[i];
        /* jshint expr:true */
        (p.x > xmax) && (xmax = p.x);
        (p.x < xmin) && (xmin = p.x);
        (p.y > ymax) && (ymax = p.y);
        (p.y < ymin) && (ymin = p.y);
    }
    this.pmin_ = new Point(xmin, ymin);
    this.pmax_ = new Point(xmax, ymax);

    var dx = kAlpha * (xmax - xmin);
    var dy = kAlpha * (ymax - ymin);
    this.head_ = new Point(xmax + dx, ymin - dy);
    this.tail_ = new Point(xmin - dx, ymin - dy);

    // Sort points along y-axis
    this.points_.sort(Point.compare);
};

/** @private */
SweepContext.prototype.initEdges = function(polyline) {
    var i, len = polyline.length;
    for (i = 0; i < len; ++i) {
        this.edge_list.push(new Edge(polyline[i], polyline[(i + 1) % len]));
    }
};

/** @private */
SweepContext.prototype.getPoint = function(index) {
    return this.points_[index];
};

/** @private */
SweepContext.prototype.addToMap = function(triangle) {
    this.map_.push(triangle);
};

/** @private */
SweepContext.prototype.locateNode = function(point) {
    return this.front_.locateNode(point.x);
};

/** @private */
SweepContext.prototype.createAdvancingFront = function() {
    var head;
    var middle;
    var tail;
    // Initial triangle
    var triangle = new Triangle(this.points_[0], this.tail_, this.head_);

    this.map_.push(triangle);

    head = new Node(triangle.getPoint(1), triangle);
    middle = new Node(triangle.getPoint(0), triangle);
    tail = new Node(triangle.getPoint(2));

    this.front_ = new AdvancingFront(head, tail);

    head.next = middle;
    middle.next = tail;
    middle.prev = head;
    tail.prev = middle;
};

/** @private */
SweepContext.prototype.removeNode = function(node) {
    // do nothing
    /* jshint unused:false */
};

/** @private */
SweepContext.prototype.mapTriangleToNodes = function(t) {
    for (var i = 0; i < 3; ++i) {
        if (!t.getNeighbor(i)) {
            var n = this.front_.locatePoint(t.pointCW(t.getPoint(i)));
            if (n) {
                n.triangle = t;
            }
        }
    }
};

/** @private */
SweepContext.prototype.removeFromMap = function(triangle) {
    var i, map = this.map_, len = map.length;
    for (i = 0; i < len; i++) {
        if (map[i] === triangle) {
            map.splice(i, 1);
            break;
        }
    }
};

/**
 * Do a depth first traversal to collect triangles
 * @private
 * @param {Triangle} triangle start
 */
SweepContext.prototype.meshClean = function(triangle) {
    // New implementation avoids recursive calls and use a loop instead.
    // Cf. issues # 57, 65 and 69.
    var triangles = [triangle], t, i;
    /* jshint boss:true */
    while (t = triangles.pop()) {
        if (!t.isInterior()) {
            t.setInterior(true);
            this.triangles_.push(t);
            for (i = 0; i < 3; i++) {
                if (!t.constrained_edge[i]) {
                    triangles.push(t.getNeighbor(i));
                }
            }
        }
    }
};

// ----------------------------------------------------------------------Exports

module.exports = SweepContext;

},{"./advancingfront":2,"./point":4,"./pointerror":5,"./sweep":7,"./triangle":9}],9:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 *
 * All rights reserved.
 * 
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

/* jshint maxcomplexity:10 */

"use strict";


/*
 * Note
 * ====
 * the structure of this JavaScript version of poly2tri intentionally follows
 * as closely as possible the structure of the reference C++ version, to make it 
 * easier to keep the 2 versions in sync.
 */

var xy = _dereq_("./xy");


// ---------------------------------------------------------------------Triangle
/**
 * Triangle class.<br>
 * Triangle-based data structures are known to have better performance than
 * quad-edge structures.
 * See: J. Shewchuk, "Triangle: Engineering a 2D Quality Mesh Generator and
 * Delaunay Triangulator", "Triangulations in CGAL"
 *
 * @constructor
 * @struct
 * @param {!XY} pa  point object with {x,y}
 * @param {!XY} pb  point object with {x,y}
 * @param {!XY} pc  point object with {x,y}
 */
var Triangle = function(a, b, c) {
    /**
     * Triangle points
     * @private
     * @type {Array.<XY>}
     */
    this.points_ = [a, b, c];

    /**
     * Neighbor list
     * @private
     * @type {Array.<Triangle>}
     */
    this.neighbors_ = [null, null, null];

    /**
     * Has this triangle been marked as an interior triangle?
     * @private
     * @type {boolean}
     */
    this.interior_ = false;

    /**
     * Flags to determine if an edge is a Constrained edge
     * @private
     * @type {Array.<boolean>}
     */
    this.constrained_edge = [false, false, false];

    /**
     * Flags to determine if an edge is a Delauney edge
     * @private
     * @type {Array.<boolean>}
     */
    this.delaunay_edge = [false, false, false];
};

var p2s = xy.toString;
/**
 * For pretty printing ex. <code>"[(5;42)(10;20)(21;30)]"</code>.
 * @public
 * @return {string}
 */
Triangle.prototype.toString = function() {
    return ("[" + p2s(this.points_[0]) + p2s(this.points_[1]) + p2s(this.points_[2]) + "]");
};

/**
 * Get one vertice of the triangle.
 * The output triangles of a triangulation have vertices which are references
 * to the initial input points (not copies): any custom fields in the
 * initial points can be retrieved in the output triangles.
 * @example
 *      var contour = [{x:100, y:100, id:1}, {x:100, y:300, id:2}, {x:300, y:300, id:3}];
 *      var swctx = new poly2tri.SweepContext(contour);
 *      swctx.triangulate();
 *      var triangles = swctx.getTriangles();
 *      typeof triangles[0].getPoint(0).id
 *      // → "number"
 * @param {number} index - vertice index: 0, 1 or 2
 * @public
 * @returns {XY}
 */
Triangle.prototype.getPoint = function(index) {
    return this.points_[index];
};

/**
 * For backward compatibility
 * @function
 * @deprecated use {@linkcode Triangle#getPoint} instead
 */
Triangle.prototype.GetPoint = Triangle.prototype.getPoint;

/**
 * Get all 3 vertices of the triangle as an array
 * @public
 * @return {Array.<XY>}
 */
// Method added in the JavaScript version (was not present in the c++ version)
Triangle.prototype.getPoints = function() {
    return this.points_;
};

/**
 * @private
 * @param {number} index
 * @returns {?Triangle}
 */
Triangle.prototype.getNeighbor = function(index) {
    return this.neighbors_[index];
};

/**
 * Test if this Triangle contains the Point object given as parameter as one of its vertices.
 * Only point references are compared, not values.
 * @public
 * @param {XY} point - point object with {x,y}
 * @return {boolean} <code>True</code> if the Point object is of the Triangle's vertices,
 *         <code>false</code> otherwise.
 */
Triangle.prototype.containsPoint = function(point) {
    var points = this.points_;
    // Here we are comparing point references, not values
    return (point === points[0] || point === points[1] || point === points[2]);
};

/**
 * Test if this Triangle contains the Edge object given as parameter as its
 * bounding edges. Only point references are compared, not values.
 * @private
 * @param {Edge} edge
 * @return {boolean} <code>True</code> if the Edge object is of the Triangle's bounding
 *         edges, <code>false</code> otherwise.
 */
Triangle.prototype.containsEdge = function(edge) {
    return this.containsPoint(edge.p) && this.containsPoint(edge.q);
};

/**
 * Test if this Triangle contains the two Point objects given as parameters among its vertices.
 * Only point references are compared, not values.
 * @param {XY} p1 - point object with {x,y}
 * @param {XY} p2 - point object with {x,y}
 * @return {boolean}
 */
Triangle.prototype.containsPoints = function(p1, p2) {
    return this.containsPoint(p1) && this.containsPoint(p2);
};

/**
 * Has this triangle been marked as an interior triangle?
 * @returns {boolean}
 */
Triangle.prototype.isInterior = function() {
    return this.interior_;
};

/**
 * Mark this triangle as an interior triangle
 * @private
 * @param {boolean} interior
 * @returns {Triangle} this
 */
Triangle.prototype.setInterior = function(interior) {
    this.interior_ = interior;
    return this;
};

/**
 * Update neighbor pointers.
 * @private
 * @param {XY} p1 - point object with {x,y}
 * @param {XY} p2 - point object with {x,y}
 * @param {Triangle} t Triangle object.
 * @throws {Error} if can't find objects
 */
Triangle.prototype.markNeighborPointers = function(p1, p2, t) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if ((p1 === points[2] && p2 === points[1]) || (p1 === points[1] && p2 === points[2])) {
        this.neighbors_[0] = t;
    } else if ((p1 === points[0] && p2 === points[2]) || (p1 === points[2] && p2 === points[0])) {
        this.neighbors_[1] = t;
    } else if ((p1 === points[0] && p2 === points[1]) || (p1 === points[1] && p2 === points[0])) {
        this.neighbors_[2] = t;
    } else {
        throw new Error('poly2tri Invalid Triangle.markNeighborPointers() call');
    }
};

/**
 * Exhaustive search to update neighbor pointers
 * @private
 * @param {!Triangle} t
 */
Triangle.prototype.markNeighbor = function(t) {
    var points = this.points_;
    if (t.containsPoints(points[1], points[2])) {
        this.neighbors_[0] = t;
        t.markNeighborPointers(points[1], points[2], this);
    } else if (t.containsPoints(points[0], points[2])) {
        this.neighbors_[1] = t;
        t.markNeighborPointers(points[0], points[2], this);
    } else if (t.containsPoints(points[0], points[1])) {
        this.neighbors_[2] = t;
        t.markNeighborPointers(points[0], points[1], this);
    }
};


Triangle.prototype.clearNeighbors = function() {
    this.neighbors_[0] = null;
    this.neighbors_[1] = null;
    this.neighbors_[2] = null;
};

Triangle.prototype.clearDelaunayEdges = function() {
    this.delaunay_edge[0] = false;
    this.delaunay_edge[1] = false;
    this.delaunay_edge[2] = false;
};

/**
 * Returns the point clockwise to the given point.
 * @private
 * @param {XY} p - point object with {x,y}
 */
Triangle.prototype.pointCW = function(p) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if (p === points[0]) {
        return points[2];
    } else if (p === points[1]) {
        return points[0];
    } else if (p === points[2]) {
        return points[1];
    } else {
        return null;
    }
};

/**
 * Returns the point counter-clockwise to the given point.
 * @private
 * @param {XY} p - point object with {x,y}
 */
Triangle.prototype.pointCCW = function(p) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if (p === points[0]) {
        return points[1];
    } else if (p === points[1]) {
        return points[2];
    } else if (p === points[2]) {
        return points[0];
    } else {
        return null;
    }
};

/**
 * Returns the neighbor clockwise to given point.
 * @private
 * @param {XY} p - point object with {x,y}
 */
Triangle.prototype.neighborCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.neighbors_[1];
    } else if (p === this.points_[1]) {
        return this.neighbors_[2];
    } else {
        return this.neighbors_[0];
    }
};

/**
 * Returns the neighbor counter-clockwise to given point.
 * @private
 * @param {XY} p - point object with {x,y}
 */
Triangle.prototype.neighborCCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.neighbors_[2];
    } else if (p === this.points_[1]) {
        return this.neighbors_[0];
    } else {
        return this.neighbors_[1];
    }
};

Triangle.prototype.getConstrainedEdgeCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.constrained_edge[1];
    } else if (p === this.points_[1]) {
        return this.constrained_edge[2];
    } else {
        return this.constrained_edge[0];
    }
};

Triangle.prototype.getConstrainedEdgeCCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.constrained_edge[2];
    } else if (p === this.points_[1]) {
        return this.constrained_edge[0];
    } else {
        return this.constrained_edge[1];
    }
};

// Additional check from Java version (see issue #88)
Triangle.prototype.getConstrainedEdgeAcross = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.constrained_edge[0];
    } else if (p === this.points_[1]) {
        return this.constrained_edge[1];
    } else {
        return this.constrained_edge[2];
    }
};

Triangle.prototype.setConstrainedEdgeCW = function(p, ce) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        this.constrained_edge[1] = ce;
    } else if (p === this.points_[1]) {
        this.constrained_edge[2] = ce;
    } else {
        this.constrained_edge[0] = ce;
    }
};

Triangle.prototype.setConstrainedEdgeCCW = function(p, ce) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        this.constrained_edge[2] = ce;
    } else if (p === this.points_[1]) {
        this.constrained_edge[0] = ce;
    } else {
        this.constrained_edge[1] = ce;
    }
};

Triangle.prototype.getDelaunayEdgeCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.delaunay_edge[1];
    } else if (p === this.points_[1]) {
        return this.delaunay_edge[2];
    } else {
        return this.delaunay_edge[0];
    }
};

Triangle.prototype.getDelaunayEdgeCCW = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.delaunay_edge[2];
    } else if (p === this.points_[1]) {
        return this.delaunay_edge[0];
    } else {
        return this.delaunay_edge[1];
    }
};

Triangle.prototype.setDelaunayEdgeCW = function(p, e) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        this.delaunay_edge[1] = e;
    } else if (p === this.points_[1]) {
        this.delaunay_edge[2] = e;
    } else {
        this.delaunay_edge[0] = e;
    }
};

Triangle.prototype.setDelaunayEdgeCCW = function(p, e) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        this.delaunay_edge[2] = e;
    } else if (p === this.points_[1]) {
        this.delaunay_edge[0] = e;
    } else {
        this.delaunay_edge[1] = e;
    }
};

/**
 * The neighbor across to given point.
 * @private
 * @param {XY} p - point object with {x,y}
 * @returns {Triangle}
 */
Triangle.prototype.neighborAcross = function(p) {
    // Here we are comparing point references, not values
    if (p === this.points_[0]) {
        return this.neighbors_[0];
    } else if (p === this.points_[1]) {
        return this.neighbors_[1];
    } else {
        return this.neighbors_[2];
    }
};

/**
 * @private
 * @param {!Triangle} t Triangle object.
 * @param {XY} p - point object with {x,y}
 */
Triangle.prototype.oppositePoint = function(t, p) {
    var cw = t.pointCW(p);
    return this.pointCW(cw);
};

/**
 * Legalize triangle by rotating clockwise around oPoint
 * @private
 * @param {XY} opoint - point object with {x,y}
 * @param {XY} npoint - point object with {x,y}
 * @throws {Error} if oPoint can not be found
 */
Triangle.prototype.legalize = function(opoint, npoint) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if (opoint === points[0]) {
        points[1] = points[0];
        points[0] = points[2];
        points[2] = npoint;
    } else if (opoint === points[1]) {
        points[2] = points[1];
        points[1] = points[0];
        points[0] = npoint;
    } else if (opoint === points[2]) {
        points[0] = points[2];
        points[2] = points[1];
        points[1] = npoint;
    } else {
        throw new Error('poly2tri Invalid Triangle.legalize() call');
    }
};

/**
 * Returns the index of a point in the triangle. 
 * The point *must* be a reference to one of the triangle's vertices.
 * @private
 * @param {XY} p - point object with {x,y}
 * @returns {number} index 0, 1 or 2
 * @throws {Error} if p can not be found
 */
Triangle.prototype.index = function(p) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if (p === points[0]) {
        return 0;
    } else if (p === points[1]) {
        return 1;
    } else if (p === points[2]) {
        return 2;
    } else {
        throw new Error('poly2tri Invalid Triangle.index() call');
    }
};

/**
 * @private
 * @param {XY} p1 - point object with {x,y}
 * @param {XY} p2 - point object with {x,y}
 * @return {number} index 0, 1 or 2, or -1 if errror
 */
Triangle.prototype.edgeIndex = function(p1, p2) {
    var points = this.points_;
    // Here we are comparing point references, not values
    if (p1 === points[0]) {
        if (p2 === points[1]) {
            return 2;
        } else if (p2 === points[2]) {
            return 1;
        }
    } else if (p1 === points[1]) {
        if (p2 === points[2]) {
            return 0;
        } else if (p2 === points[0]) {
            return 2;
        }
    } else if (p1 === points[2]) {
        if (p2 === points[0]) {
            return 1;
        } else if (p2 === points[1]) {
            return 0;
        }
    }
    return -1;
};

/**
 * Mark an edge of this triangle as constrained.
 * @private
 * @param {number} index - edge index
 */
Triangle.prototype.markConstrainedEdgeByIndex = function(index) {
    this.constrained_edge[index] = true;
};
/**
 * Mark an edge of this triangle as constrained.
 * @private
 * @param {Edge} edge instance
 */
Triangle.prototype.markConstrainedEdgeByEdge = function(edge) {
    this.markConstrainedEdgeByPoints(edge.p, edge.q);
};
/**
 * Mark an edge of this triangle as constrained.
 * This method takes two Point instances defining the edge of the triangle.
 * @private
 * @param {XY} p - point object with {x,y}
 * @param {XY} q - point object with {x,y}
 */
Triangle.prototype.markConstrainedEdgeByPoints = function(p, q) {
    var points = this.points_;
    // Here we are comparing point references, not values        
    if ((q === points[0] && p === points[1]) || (q === points[1] && p === points[0])) {
        this.constrained_edge[2] = true;
    } else if ((q === points[0] && p === points[2]) || (q === points[2] && p === points[0])) {
        this.constrained_edge[1] = true;
    } else if ((q === points[1] && p === points[2]) || (q === points[2] && p === points[1])) {
        this.constrained_edge[0] = true;
    }
};


// ---------------------------------------------------------Exports (public API)

module.exports = Triangle;

},{"./xy":11}],10:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 * 
 * All rights reserved.
 * 
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

"use strict";

/**
 * Precision to detect repeated or collinear points
 * @private
 * @const {number}
 * @default
 */
var EPSILON = 1e-12;
exports.EPSILON = EPSILON;

/**
 * @private
 * @enum {number}
 * @readonly
 */
var Orientation = {
    "CW": 1,
    "CCW": -1,
    "COLLINEAR": 0
};
exports.Orientation = Orientation;


/**
 * Formula to calculate signed area<br>
 * Positive if CCW<br>
 * Negative if CW<br>
 * 0 if collinear<br>
 * <pre>
 * A[P1,P2,P3]  =  (x1*y2 - y1*x2) + (x2*y3 - y2*x3) + (x3*y1 - y3*x1)
 *              =  (x1-x3)*(y2-y3) - (y1-y3)*(x2-x3)
 * </pre>
 *
 * @private
 * @param {!XY} pa  point object with {x,y}
 * @param {!XY} pb  point object with {x,y}
 * @param {!XY} pc  point object with {x,y}
 * @return {Orientation}
 */
function orient2d(pa, pb, pc) {
    var detleft = (pa.x - pc.x) * (pb.y - pc.y);
    var detright = (pa.y - pc.y) * (pb.x - pc.x);
    var val = detleft - detright;
    if (val > -(EPSILON) && val < (EPSILON)) {
        return Orientation.COLLINEAR;
    } else if (val > 0) {
        return Orientation.CCW;
    } else {
        return Orientation.CW;
    }
}
exports.orient2d = orient2d;


/**
 *
 * @private
 * @param {!XY} pa  point object with {x,y}
 * @param {!XY} pb  point object with {x,y}
 * @param {!XY} pc  point object with {x,y}
 * @param {!XY} pd  point object with {x,y}
 * @return {boolean}
 */
function inScanArea(pa, pb, pc, pd) {
    var oadb = (pa.x - pb.x) * (pd.y - pb.y) - (pd.x - pb.x) * (pa.y - pb.y);
    if (oadb >= -EPSILON) {
        return false;
    }

    var oadc = (pa.x - pc.x) * (pd.y - pc.y) - (pd.x - pc.x) * (pa.y - pc.y);
    if (oadc <= EPSILON) {
        return false;
    }
    return true;
}
exports.inScanArea = inScanArea;


/**
 * Check if the angle between (pa,pb) and (pa,pc) is obtuse i.e. (angle > π/2 || angle < -π/2)
 *
 * @private
 * @param {!XY} pa  point object with {x,y}
 * @param {!XY} pb  point object with {x,y}
 * @param {!XY} pc  point object with {x,y}
 * @return {boolean} true if angle is obtuse
 */
function isAngleObtuse(pa, pb, pc) {
    var ax = pb.x - pa.x;
    var ay = pb.y - pa.y;
    var bx = pc.x - pa.x;
    var by = pc.y - pa.y;
    return (ax * bx + ay * by) < 0;
}
exports.isAngleObtuse = isAngleObtuse;


},{}],11:[function(_dereq_,module,exports){
/*
 * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 * 
 * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
 * https://github.com/r3mi/poly2tri.js
 * 
 * All rights reserved.
 * 
 * Distributed under the 3-clause BSD License, see LICENSE.txt
 */

"use strict";

/**
 * The following functions operate on "Point" or any "Point like" object with {x,y},
 * as defined by the {@link XY} type
 * ([duck typing]{@link http://en.wikipedia.org/wiki/Duck_typing}).
 * @module
 * @private
 */

/**
 * poly2tri.js supports using custom point class instead of {@linkcode Point}.
 * Any "Point like" object with <code>{x, y}</code> attributes is supported
 * to initialize the SweepContext polylines and points
 * ([duck typing]{@link http://en.wikipedia.org/wiki/Duck_typing}).
 *
 * poly2tri.js might add extra fields to the point objects when computing the
 * triangulation : they are prefixed with <code>_p2t_</code> to avoid collisions
 * with fields in the custom class.
 *
 * @example
 *      var contour = [{x:100, y:100}, {x:100, y:300}, {x:300, y:300}, {x:300, y:100}];
 *      var swctx = new poly2tri.SweepContext(contour);
 *
 * @typedef {Object} XY
 * @property {number} x - x coordinate
 * @property {number} y - y coordinate
 */


/**
 * Point pretty printing : prints x and y coordinates.
 * @example
 *      xy.toStringBase({x:5, y:42})
 *      // → "(5;42)"
 * @protected
 * @param {!XY} p - point object with {x,y}
 * @returns {string} <code>"(x;y)"</code>
 */
function toStringBase(p) {
    return ("(" + p.x + ";" + p.y + ")");
}

/**
 * Point pretty printing. Delegates to the point's custom "toString()" method if exists,
 * else simply prints x and y coordinates.
 * @example
 *      xy.toString({x:5, y:42})
 *      // → "(5;42)"
 * @example
 *      xy.toString({x:5,y:42,toString:function() {return this.x+":"+this.y;}})
 *      // → "5:42"
 * @param {!XY} p - point object with {x,y}
 * @returns {string} <code>"(x;y)"</code>
 */
function toString(p) {
    // Try a custom toString first, and fallback to own implementation if none
    var s = p.toString();
    return (s === '[object Object]' ? toStringBase(p) : s);
}


/**
 * Compare two points component-wise. Ordered by y axis first, then x axis.
 * @param {!XY} a - point object with {x,y}
 * @param {!XY} b - point object with {x,y}
 * @return {number} <code>&lt; 0</code> if <code>a &lt; b</code>,
 *         <code>&gt; 0</code> if <code>a &gt; b</code>, 
 *         <code>0</code> otherwise.
 */
function compare(a, b) {
    if (a.y === b.y) {
        return a.x - b.x;
    } else {
        return a.y - b.y;
    }
}

/**
 * Test two Point objects for equality.
 * @param {!XY} a - point object with {x,y}
 * @param {!XY} b - point object with {x,y}
 * @return {boolean} <code>True</code> if <code>a == b</code>, <code>false</code> otherwise.
 */
function equals(a, b) {
    return a.x === b.x && a.y === b.y;
}


module.exports = {
    toString: toString,
    toStringBase: toStringBase,
    compare: compare,
    equals: equals
};

},{}]},{},[6])
(6)
});
/* global G:false */
G.GLShaderUtil = {

	compile: function(gl, type, string) {
		if (!gl) {
			console.error('No WebGL context!');
			return;
		}

		var shader = gl.createShader(type);
		gl.shaderSource(shader, string);
		gl.compileShader(shader);

		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
			console.error('Compile shader error:\n', string);
		}

		return shader;
	},

	genProgram: function(gl, vertexShader, fragmentShader) {
		if (!gl) {
			console.error('No WebGL context!');
			return;
		}

		var program = gl.createProgram();

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error('Link WebGL program error');
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
		}

		return program;
	},

	TILE_VS: (function() {
		var lines = [
			'const float DEGREE_PER_RADIAN = 180.0/3.14159265358979323846264;',

			'void rotate(in vec2 v, in float theta, out vec2 result) {',
			    'float c = cos(theta);',
			    'float s = sin(theta);',
			    'result = vec2(c*v.x - s*v.y, s*v.x + c*v.y);',
			'}',

			'uniform mat4 u_mv, u_p;',
			'uniform vec2 u_canvas_offset;',

			'uniform vec2 u_zoom_around;',
			'uniform float u_zoom_scale;',
			'uniform int u_ignore_rotate;',

			'uniform float u_res;',
			'uniform vec2 u_center;',
			'uniform vec2 u_size;',
			'uniform float u_rotate;',

			'attribute vec2 a_pt;',

			'attribute vec2 a_texcoord;',
			'varying vec2 v_texcoord;',

			'void main(){',

				'float hw = u_size.x/2.0;',
				'float hh = u_size.y/2.0;',

				'float x = hw + (a_pt.x - u_center.x) /u_res;',
				'float y = hh - (a_pt.y - u_center.y) /u_res;',

				'if( (u_zoom_scale>0.0) && (u_zoom_scale!=1.0) ) {',
					'float zoom_delta = 1.0/u_zoom_scale - 1.0;',
					'x += (x - u_zoom_around.x)*zoom_delta;',
					'y += (y - u_zoom_around.y)*zoom_delta;',
				'}',

				'float dx = x - hw;',
				'float dy = y - hh;',

				'if( (u_rotate!=0.0) && (dx!=0.0) && (dy!=0.0) && (u_ignore_rotate!=0) ) {',
					'float theta = u_rotate/DEGREE_PER_RADIAN;',
					'vec2 v;',
					'rotate(vec2(dx, dy), theta, v);',
					'x = v.x + hw;',
					'y = v.y + hh;',
				'}',

				'x += u_canvas_offset.x;',
				'y += u_canvas_offset.y;',

				'gl_Position = u_p * u_mv * vec4(x, -y, 0.0, 1.0);',
				'v_texcoord = a_texcoord;',

			'}'
		];

		return lines.join('\n');
	})(),

	TILE_FS: (function() {
		var lines = [
			'#ifdef GL_ES',
			'precision highp float;',
			'#endif',

			'uniform float u_alpha;',
			'uniform sampler2D u_sampler;',

			'varying vec2 v_texcoord;',

			'void main(){',
				'vec4 v_color = texture2D(u_sampler, vec2(v_texcoord.s, v_texcoord.t));',
				'gl_FragColor = vec4(v_color.rgb, v_color.a * u_alpha);',
			'}'
		];

		return lines.join('\n');
	})(),

	PT_VS: (function() {
		var lines = [
			'const float DEGREE_PER_RADIAN = 180.0/3.14159265358979323846264;',

			'void rotate(in vec2 v, in float theta, out vec2 result) {',
			    'float c = cos(theta);',
			    'float s = sin(theta);',
			    'result = vec2(c*v.x - s*v.y, s*v.x + c*v.y);',
			'}',

			'uniform mat4 u_mv, u_p;',
			'uniform vec2 u_canvas_offset;',

			'uniform vec2 u_graphic_offset;',

			'uniform vec2 u_zoom_around;',
			'uniform float u_zoom_scale;',
			'uniform int u_ignore_rotate;',

			'uniform float u_res;',
			'uniform vec2 u_center;',
			'uniform vec2 u_size;',
			'uniform float u_rotate;',

			'attribute vec2 a_pt;',

			'uniform vec4 u_color;',
			'uniform vec2 u_shape_size;',
			'uniform vec2 u_offset;',

			'varying vec4 v_color;',

			'void main(){',

				'float hw = u_size.x/2.0;',
				'float hh = u_size.y/2.0;',

				'float x = hw + (a_pt.x + u_graphic_offset.x - u_center.x) /u_res;',
				'float y = hh - (a_pt.y + u_graphic_offset.y - u_center.y) /u_res;',

				'if( (u_zoom_scale>0.0) && (u_zoom_scale!=1.0) ) {',
					'float zoom_delta = 1.0/u_zoom_scale - 1.0;',
					'x += (x - u_zoom_around.x)*zoom_delta;',
					'y += (y - u_zoom_around.y)*zoom_delta;',
				'}',

				'float dx = x - hw;',
				'float dy = y - hh;',

				'if( (u_rotate!=0.0) && (dx!=0.0) && (dy!=0.0) && (u_ignore_rotate!=0) ) {',
					'float theta = u_rotate/DEGREE_PER_RADIAN;',
					'vec2 v;',
					'rotate(vec2(dx, dy), theta, v);',
					'x = v.x + hw;',
					'y = v.y + hh + u_offset.y;',
				'}',

				'x += u_offset.x;',
				'y += u_offset.y;',

				'x += u_canvas_offset.x;',
				'y += u_canvas_offset.y;',

				'gl_Position = u_p * u_mv * vec4(x, -y, 0.0, 1.0);',
				'gl_PointSize = u_shape_size.x;',
				'v_color = u_color;',

			'}'
		];

		return lines.join('\n');
	})(),

	PT_FS: (function() {
		var lines = [
			'#ifdef GL_ES',
			'precision highp float;',
			'#endif',

			'varying vec4 v_color;',

			'void main(){',
				'gl_FragColor = v_color;',
			'}'
		];

		return lines.join('\n');
	})(),

	LINE_VS: (function() {
		var lines = [
			'const float DEGREE_PER_RADIAN = 180.0/3.14159265358979323846264;',

			'void rotate(in vec2 v, in float theta, out vec2 result) {',
			    'float c = cos(theta);',
			    'float s = sin(theta);',
			    'result = vec2(c*v.x - s*v.y, s*v.x + c*v.y);',
			'}',

			'uniform mat4 u_mv, u_p;',
			'uniform vec2 u_canvas_offset;',

			'uniform vec2 u_graphic_offset;',

			'uniform vec2 u_zoom_around;',
			'uniform float u_zoom_scale;',
			'uniform int u_ignore_rotate;',

			'uniform float u_res;',
			'uniform vec2 u_center;',
			'uniform vec2 u_size;',
			'uniform float u_rotate;',

			'attribute vec2 a_pt;',
			
			'uniform vec4 u_color;',

			'varying vec4 v_color;',

			'void main(){',

				'float hw = u_size.x/2.0;',
				'float hh = u_size.y/2.0;',

				'float x = hw + (a_pt.x + u_graphic_offset.x - u_center.x) /u_res;',
				'float y = hh - (a_pt.y + u_graphic_offset.y - u_center.y) /u_res;',

				'if( (u_zoom_scale>0.0) && (u_zoom_scale!=1.0) ) {',
					'float zoom_delta = 1.0/u_zoom_scale - 1.0;',
					'x += (x - u_zoom_around.x)*zoom_delta;',
					'y += (y - u_zoom_around.y)*zoom_delta;',
				'}',

				'float dx = x - hw;',
				'float dy = y - hh;',

				'if( (u_rotate!=0.0) && (dx!=0.0) && (dy!=0.0) && (u_ignore_rotate!=0) ) {',
					'float theta = u_rotate/DEGREE_PER_RADIAN;',
					'vec2 v;',
					'rotate(vec2(dx, dy), theta, v);',
					'x = v.x + hw;',
					'y = v.y + hh;',
				'}',

				'x += u_canvas_offset.x;',
				'y += u_canvas_offset.y;',

				'gl_Position = u_p * u_mv * vec4(x, -y, 0.0, 1.0);',
				'v_color = u_color;',

			'}'
		];

		return lines.join('\n');
	})(),

	LINE_FS: (function() {
		var lines = [
			'#ifdef GL_ES',
			'precision highp float;',
			'#endif',

			'varying vec4 v_color;',

			'void main(){',
				'gl_FragColor = v_color;',
			'}'
		];

		return lines.join('\n');
	})(),

	FILL_VS: (function() {
		var lines = [
			'const float DEGREE_PER_RADIAN = 180.0/3.14159265358979323846264;',

			'void rotate(in vec2 v, in float theta, out vec2 result) {',
			    'float c = cos(theta);',
			    'float s = sin(theta);',
			    'result = vec2(c*v.x - s*v.y, s*v.x + c*v.y);',
			'}',

			'uniform mat4 u_mv, u_p;',
			'uniform vec2 u_canvas_offset;',

			'uniform vec2 u_graphic_offset;',

			'uniform vec2 u_zoom_around;',
			'uniform float u_zoom_scale;',
			'uniform int u_ignore_rotate;',

			'uniform float u_res;',
			'uniform vec2 u_center;',
			'uniform vec2 u_size;',
			'uniform float u_rotate;',

			'attribute vec2 a_pt;',

			'uniform float u_fill_image;',
			'uniform vec2 u_image_size;',
			'uniform float u_alpha;',
			'uniform vec4 u_color;',

			'varying float v_fill_image;',
			'varying vec2 v_texcoord;',
			'varying float v_alpha;',
			'varying vec4 v_color;',

			'void main(){',

				'float hw = u_size.x/2.0;',
				'float hh = u_size.y/2.0;',

				'float x = hw + (a_pt.x + u_graphic_offset.x - u_center.x) /u_res;',
				'float y = hh - (a_pt.y + u_graphic_offset.y - u_center.y) /u_res;',

				'if( (u_zoom_scale>0.0) && (u_zoom_scale!=1.0) ) {',
					'float zoom_delta = 1.0/u_zoom_scale - 1.0;',
					'x += (x - u_zoom_around.x)*zoom_delta;',
					'y += (y - u_zoom_around.y)*zoom_delta;',
				'}',

				'float dx = x - hw;',
				'float dy = y - hh;',

				'if( (u_rotate!=0.0) && (dx!=0.0) && (dy!=0.0) && (u_ignore_rotate!=0) ) {',
					'float theta = u_rotate/DEGREE_PER_RADIAN;',
					'vec2 v;',
					'rotate(vec2(dx, dy), theta, v);',
					'x = v.x + hw;',
					'y = v.y + hh;',
				'}',

				'x += u_canvas_offset.x;',
				'y += u_canvas_offset.y;',

				'gl_Position = u_p * u_mv * vec4(x, -y, 0.0, 1.0);',
				'v_color = u_color;',
				'v_alpha = u_alpha;',

				'v_fill_image = u_fill_image;',
				'if( v_fill_image!=0.0 ){',
					'float imageWidth = u_image_size.x;',
					'float imageHeight = u_image_size.y;',
					'float texcoordX = x/imageWidth;',
					'float texcoordY = y/imageHeight;',
					'v_texcoord = vec2(texcoordX, texcoordY);',
				'}',

			'}'
		];

		return lines.join('\n');
	})(),

	FILL_FS: (function() {
		var lines = [
			'#ifdef GL_ES',
			'precision highp float;',
			'#endif',

			'uniform sampler2D u_sampler;',

			'varying float v_fill_image;',
			'varying vec2 v_texcoord;',
			'varying float v_alpha;',

			'varying vec4 v_color;',

			'void main(){',
				'if( v_fill_image!=0.0 ){',
					'vec4 tex = texture2D(u_sampler, vec2(v_texcoord.s, v_texcoord.t));',
	     			'gl_FragColor = vec4(tex.rgb, tex.a * v_alpha);',
	     		'}else{',
					'gl_FragColor = v_color;',
	     		'}',
			'}'
		];

		return lines.join('\n');
	})(),

	SHAPE_FILL_VS: (function() { // circle | rect
		var lines = [
			'const float DEGREE_PER_RADIAN = 180.0/3.14159265358979323846264;',
			'const float PI_2 = 2.0*3.14159265358979323846264;',

			'void rotate(in vec2 v, in float theta, out vec2 result) {',
			    'float c = cos(theta);',
			    'float s = sin(theta);',
			    'result = vec2(c*v.x - s*v.y, s*v.x + c*v.y);',
			'}',

			'uniform mat4 u_mv, u_p;',
			'uniform vec2 u_canvas_offset;',
			'uniform vec2 u_canvas_scale;',

			'uniform vec2 u_graphic_offset;',

			'uniform vec2 u_zoom_around;',
			'uniform float u_zoom_scale;',
			'uniform int u_ignore_rotate;',

			'uniform float u_res;',
			'uniform vec2 u_center;',
			'uniform vec2 u_size;',
			'uniform float u_rotate;',

			'uniform int u_shape;', // 1:circle 2:rect
			'uniform float u_size_x;',
			'uniform float u_size_y;',
			'uniform float u_offset_x;',
			'uniform float u_offset_y;',
			'attribute vec3 a_pt;',

			'uniform float u_fill_image;',
			'uniform vec2 u_image_size;',
			'uniform float u_alpha;',
			'uniform vec4 u_color;',
			'uniform vec4 u_color_center;',

			'varying float v_fill_image;',
			'varying vec2 v_texcoord;',
			'varying float v_alpha;',
			'varying vec4 v_color;',

			'void main(){',

				'float hw = u_size.x/2.0;',
				'float hh = u_size.y/2.0;',

				'float x = hw + (a_pt.x + u_graphic_offset.x - u_center.x)/u_res;',
				'float y = hh - (a_pt.y + u_graphic_offset.y - u_center.y)/u_res;',
				'float z = a_pt.z;',

				'if( (u_zoom_scale>0.0) && (u_zoom_scale!=1.0) ) {',
					'float zoom_delta = 1.0/u_zoom_scale - 1.0;',
					'x += (x - u_zoom_around.x)*zoom_delta;',
					'y += (y - u_zoom_around.y)*zoom_delta;',
				'}',

				'float dx = x - hw;',
				'float dy = y - hh;',

				'if( (u_rotate!=0.0) && (dx!=0.0) && (dy!=0.0) && (u_ignore_rotate!=0) ) {',
					'float theta = u_rotate/DEGREE_PER_RADIAN;',
					'vec2 v;',
					'rotate(vec2(dx, dy), theta, v);',
					'x = v.x + hw;',
					'y = v.y + hh;',
				'}',

				'float hw_shape = u_size_x/2.0;',
				'float hh_shape = u_size_y/2.0;',

				'if(u_shape==1){',
					'if(z!=-1.0){',
						'float theta = PI_2*z;',
						'x += hw_shape * sin(theta);',
						'y += hw_shape * cos(theta);',
					'}',
				'}else if(u_shape==2){',
					'if(z==1.0){',
						'x -= hw_shape;',
						'y -= hh_shape;',
					'}else if(z==2.0){',
						'x += hw_shape;',
						'y -= hh_shape;',
					'}else if(z==3.0){',
						'x += hw_shape;',
						'y += hh_shape;',
					'}else if(z==4.0){',
						'x -= hw_shape;',
						'y += hh_shape;',
					'}',
				'}',

				'x += u_offset_x;',
				'y += u_offset_y;',

				'x += u_canvas_offset.x;',
				'y += u_canvas_offset.y;',

				'gl_Position = u_p * u_mv * vec4(x, -y, 0.0, 1.0);',

				'if(u_shape==1){',
					'if(z!=-1.0){',
						'v_color = u_color;',
					'} else {',
						'v_color = u_color_center;',
					'}',
				'}else if(u_shape==2){',
					'if(z!=0.0){',
						'v_color = u_color;',
					'} else {',
						'v_color = u_color_center;',
					'}',
				'}',

				'v_alpha = u_alpha;',

				'v_fill_image = u_fill_image;',
				'if( v_fill_image!=0.0 ){',
					'float imageWidth = u_image_size.x;',
					'float imageHeight = u_image_size.y;',
					'float texcoordX = x/imageWidth;',
					'float texcoordY = y/imageHeight;',
					'v_texcoord = vec2(texcoordX, texcoordY);',
				'}',

			'}'
		];

		return lines.join('\n');
	})(),

	SHAPE_FILL_FS: (function() {
		var lines = [
			'#ifdef GL_ES',
			'precision highp float;',
			'#endif',

			'uniform sampler2D u_sampler;',

			'varying float v_fill_image;',
			'varying vec2 v_texcoord;',
			'varying float v_alpha;',

			'varying vec4 v_color;',

			'void main(){',
				'if( v_fill_image!=0.0 ){',
					'vec4 tex = texture2D(u_sampler, vec2(v_texcoord.s, v_texcoord.t));',
	     			'gl_FragColor = vec4(tex.rgb, tex.a * v_alpha);',
	     		'}else{',
					'gl_FragColor = v_color;',
	     		'}',
			'}'
		];

		return lines.join('\n');
	})(),

	SHAPE_LINE_VS: (function() {
		var lines = [
			'const float DEGREE_PER_RADIAN = 180.0/3.14159265358979323846264;',
			'const float PI_2 = 2.0*3.14159265358979323846264;',

			'void rotate(in vec2 v, in float theta, out vec2 result) {',
			    'float c = cos(theta);',
			    'float s = sin(theta);',
			    'result = vec2(c*v.x - s*v.y, s*v.x + c*v.y);',
			'}',

			'uniform mat4 u_mv, u_p;',
			'uniform vec2 u_canvas_offset;',
			'uniform vec2 u_canvas_scale;',

			'uniform vec2 u_graphic_offset;',

			'uniform vec2 u_zoom_around;',
			'uniform float u_zoom_scale;',
			'uniform int u_ignore_rotate;',

			'uniform float u_res;',
			'uniform vec2 u_center;',
			'uniform vec2 u_size;',
			'uniform float u_rotate;',

			'uniform int u_shape;', // 1:circle 2:rect
			'uniform float u_size_x;',
			'uniform float u_size_y;',
			'uniform float u_offset_x;',
			'uniform float u_offset_y;',
			'attribute vec3 a_pt;',
			
			'uniform vec4 u_color;',

			'varying vec4 v_color;',

			'void main(){',

				'float hw = u_size.x/2.0;',
				'float hh = u_size.y/2.0;',

				'float x = hw + (a_pt.x + u_graphic_offset.x - u_center.x) /u_res;',
				'float y = hh - (a_pt.y + u_graphic_offset.y - u_center.y) /u_res;',
				'float z = a_pt.z;',

				'if( (u_zoom_scale>0.0) && (u_zoom_scale!=1.0) ) {',
					'float zoom_delta = 1.0/u_zoom_scale - 1.0;',
					'x += (x - u_zoom_around.x)*zoom_delta;',
					'y += (y - u_zoom_around.y)*zoom_delta;',
				'}',

				'float dx = x - hw;',
				'float dy = y - hh;',

				'if( (u_rotate!=0.0) && (dx!=0.0) && (dy!=0.0) && (u_ignore_rotate!=0) ) {',
					'float theta = u_rotate/DEGREE_PER_RADIAN;',
					'vec2 v;',
					'rotate(vec2(dx, dy), theta, v);',
					'x = v.x + hw;',
					'y = v.y + hh;',
				'}',

				'float hw_shape = u_size_x / 2.0;',
				'float hh_shape = u_size_y / 2.0;',
				'if(u_shape==1){',
					'if(z!=-1.0){',
						'float theta = PI_2*z;',
						'x += hw_shape * sin(theta);',
						'y += hw_shape * cos(theta);',
					'}',
				'}else if(u_shape==2){',
					'if(z==1.0){',
						'x -= hw_shape;',
						'y -= hh_shape;',
					'}else if(z==2.0){',
						'x += hw_shape;',
						'y -= hh_shape;',
					'}else if(z==3.0){',
						'x += hw_shape;',
						'y += hh_shape;',
					'}else if(z==4.0){',
						'x -= hw_shape;',
						'y += hh_shape;',
					'}',
				'}',

				'x += u_offset_x;',
				'y += u_offset_y;',

				'x += u_canvas_offset.x;',
				'y += u_canvas_offset.y;',

				'gl_Position = u_p * u_mv * vec4(x, -y, 0.0, 1.0);',
				'v_color = u_color;',

			'}'
		];

		return lines.join('\n');
	})(),

	SHAPE_LINE_FS: (function() {
		var lines = [
			'#ifdef GL_ES',
			'precision highp float;',
			'#endif',

			'varying vec4 v_color;',

			'void main(){',
				'gl_FragColor = v_color;',
			'}'
		];

		return lines.join('\n');
	})(),

	SHAPE_IMAGE_VS: (function() {
		var lines = [
			'const float DEGREE_PER_RADIAN = 180.0/3.14159265358979323846264;',

			'void rotate(in vec2 v, in float theta, out vec2 result) {',
			    'float c = cos(theta);',
			    'float s = sin(theta);',
			    'result = vec2(c*v.x - s*v.y, s*v.x + c*v.y);',
			'}',

			'uniform mat4 u_mv, u_p;',
			'uniform vec2 u_canvas_offset;',
			'uniform vec2 u_canvas_scale;',

			'uniform vec2 u_graphic_offset;',

			'uniform vec2 u_zoom_around;',
			'uniform float u_zoom_scale;',
			'uniform int u_ignore_rotate;',

			'uniform float u_res;',
			'uniform vec2 u_center;',
			'uniform vec2 u_size;',
			'uniform float u_rotate;',

			'uniform float u_size_x;',
			'uniform float u_size_y;',
			'uniform float u_offset_x;',
			'uniform float u_offset_y;',
			'uniform float u_image_rotate;',
			'uniform float u_texture_size;',
			'attribute vec3 a_pt;',

			'varying vec2 v_texcoord;',

			'void main(){',

				'float hw = u_size.x/2.0;',
				'float hh = u_size.y/2.0;',

				'float x = hw + (a_pt.x + u_graphic_offset.x - u_center.x)/u_res;',
				'float y = hh - (a_pt.y + u_graphic_offset.y - u_center.y)/u_res;',
				'float z = a_pt.z;',

				'if( (u_zoom_scale>0.0) && (u_zoom_scale!=1.0) ) {',
					'float zoom_delta = 1.0/u_zoom_scale - 1.0;',
					'x += (x - u_zoom_around.x)*zoom_delta;',
					'y += (y - u_zoom_around.y)*zoom_delta;',
				'}',

				'float dx = x - hw;',
				'float dy = y - hh;',

				'if( (u_rotate!=0.0) && (dx!=0.0) && (dy!=0.0) && (u_ignore_rotate!=0) ) {',
					'float theta = u_rotate/DEGREE_PER_RADIAN;',
					'vec2 v;',
					'rotate(vec2(dx, dy), theta, v);',
					'x = v.x + hw;',
					'y = v.y + hh;',
				'}',

				'float hw_shape = u_size_x/2.0;',
				'float hh_shape = u_size_y/2.0;',
				'float texcoordX = 0.0;',
				'float texcoordY = 0.0;',

				// 计算图片四个角点及中心点相对点实际位置的向量，并进行旋转
				'float vx = u_offset_x;',
				'float vy = u_offset_y;',

				'if(z==0.0){',
					'vx += hw_shape;',
					'vy += hh_shape;',
					'texcoordX = hw_shape/u_texture_size;',
					'texcoordY = (u_texture_size - hh_shape)/u_texture_size;',
				'}else if(z==1.0){',
					'texcoordY = 1.0;',
				'}else if(z==2.0){',
					'vx += u_size_x;',
					'texcoordX = u_size_x/u_texture_size;',
					'texcoordY = 1.0;',
				'}else if(z==3.0){',
					'vx += u_size_x;',
					'vy += u_size_y;',
					'texcoordX = u_size_x/u_texture_size;',
					'texcoordY = (u_texture_size - u_size_y)/u_texture_size;',
				'}else if(z==4.0){',
					'vy += u_size_y;',
					'texcoordY = (u_texture_size - u_size_y)/u_texture_size;',
				'}',
				'v_texcoord = vec2(texcoordX, texcoordY);',

				// 旋转后相对实际坐标点的向量
				'float ra = u_image_rotate/DEGREE_PER_RADIAN;',
				'vec2 rv;',
				'rotate(vec2(vx, vy), ra, rv);',

				'x += rv.x;',
				'y += rv.y;',

				'x += u_canvas_offset.x;',
				'y += u_canvas_offset.y;',

				'gl_Position = u_p * u_mv * vec4(x, -y, 0.0, 1.0);',
			'}'
		];

		return lines.join('\n');
	})(),

	SHAPE_IMAGE_FS: (function() {
		var lines = [
			'#ifdef GL_ES',
			'precision highp float;',
			'#endif',

			'uniform sampler2D u_sampler;',

			'varying vec2 v_texcoord;',

			'void main(){',
	     		'gl_FragColor = texture2D(u_sampler, vec2(v_texcoord.s, v_texcoord.t));',
			'}'
		];

		return lines.join('\n');
	})()


};
/* global G:false */
G.GLCamera = G.Class.extend({

	init: function() {
		var self = this;

		self._pos = vec3.create();
		self._target = vec3.create();
		self._up = vec3.fromValues(0, 1, 0);

		self._mvMatrix = mat4.create();
		self._pMatrix = mat4.create();
	},

	moveTo: function(x, y, z) {
		var self = this;

		vec3.set(self._pos, x, y, z);

		mat4.lookAt(self._mvMatrix, self._pos, self._target, self._up);

		return self;
	},

	lookAt: function(x, y, z) {
		var self = this;

		vec3.set(self._target, x, y, z);

		mat4.lookAt(self._mvMatrix, self._pos, self._target, self._up);

		return self;
	}


});
/* global G:false */
G.GLOrthoCamera = G.GLCamera.extend({

	init: function(left, right, bottom, top, near, far) {
		var self = this;

		G.GLCamera.prototype.init.call(self);

		self.left = left;
		self.right = right;
		self.bottom = bottom;
		self.top = top;
		self.near = (near === undefined) ? 1 : near;
		self.far = (far === undefined) ? 2e8 : far;

		self._updatePMatrix();
	},

	_updatePMatrix: function() {
		var self = this;

		mat4.ortho(self._pMatrix, self.left, self.right, self.bottom, self.top, self.near, self.far);

		return self;
	}


});
/* global G:false */
G.GLDrawUtil = {


	_tileIndices: new Uint16Array([
		0, 1, 2, //
		0, 2, 3
	]),

	_tileTextureCoords: new Float32Array([
		0, 1, // LT
		1, 1, // RT
		1, 0, // RB
		0, 0 // LB
	]),

	_bufferFloat32Array: function(gl, buffer, float32Array, index, size) {
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(index);
		gl.vertexAttribPointer(index, size, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	},

	drawTile: function(layer, tile, pts, alpha) { // tile为正方形图片，pts中包含4个顶点
		var self = this;

		var map = layer._map;
		if (!map) {
			return;
		}

		var gl = map._gl;
		var camera = map._camera;
		var canvasOffset = map._canvasOffset;

		var center = map.getCenter();
		var size = map.getSize();
		var zoomScale = layer._zoomScale || layer._scale;
		var zoomAround = layer._aroundScreen || [];

		var texture;
		if (tile._loaded) {
			if (!tile._gl_t) {
				texture = tile._gl_t = gl.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tile);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.generateMipmap(gl.TEXTURE_2D);
				gl.bindTexture(gl.TEXTURE_2D, null);
			}
		} else {
			return;
		}

		texture = tile._gl_t;
		if (!texture) {
			return;
		}

		var program = gl.tileProgram;
		gl.useProgram(program);

		var u_mv = tile._gl_u_mv = tile._gl_u_mv || gl.getUniformLocation(program, 'u_mv');
		var u_p = tile._gl_u_p = tile._gl_u_p || gl.getUniformLocation(program, 'u_p');
		var u_canvas_offset = tile._gl_u_canvas_offset = tile._gl_u_canvas_offset || gl.getUniformLocation(program, 'u_canvas_offset');

		var u_zoom_around = tile._gl_u_zoom_around = tile._gl_u_zoom_around || gl.getUniformLocation(program, 'u_zoom_around');
		var u_zoom_scale = tile._gl_u_zoom_scale = tile._gl_u_zoom_scale || gl.getUniformLocation(program, 'u_zoom_scale');
		var u_ignore_rotate = tile._gl_u_ignore_rotate = tile._gl_u_ignore_rotate || gl.getUniformLocation(program, 'u_ignore_rotate');

		var u_res = tile._gl_u_res = tile._gl_u_res || gl.getUniformLocation(program, 'u_res');
		var u_center = tile._gl_u_center = tile._gl_u_center || gl.getUniformLocation(program, 'u_center');
		var u_size = tile._gl_u_size = tile._gl_u_size || gl.getUniformLocation(program, 'u_size');
		var u_rotate = tile._gl_u_rotate = tile._gl_u_rotate || gl.getUniformLocation(program, 'u_rotate');

		var a_pt = tile._gl_a_pt = tile._gl_a_pt || gl.getAttribLocation(program, 'a_pt');

		var u_sampler = tile._gl_u_sampler = tile._gl_u_sampler || gl.getUniformLocation(program, 'u_sampler');
		var a_texcoord = tile._gl_a_texcoord = tile._gl_a_texcoord || gl.getAttribLocation(program, 'a_texcoord');

		var u_alpha = tile._gl_u_alpha = tile._gl_u_alpha || gl.getUniformLocation(program, 'u_alpha');

		gl.uniformMatrix4fv(u_mv, false, camera._mvMatrix);
		gl.uniformMatrix4fv(u_p, false, camera._pMatrix);
		gl.uniform2f(u_canvas_offset, canvasOffset[0], canvasOffset[1]);

		gl.uniform2f(u_zoom_around, zoomAround[0] || 0, zoomAround[1] || 0);
		gl.uniform1f(u_zoom_scale, zoomScale || 1);
		gl.uniform1i(u_ignore_rotate, 1);

		gl.uniform1f(u_res, map._res);
		gl.uniform2f(u_center, center[0], center[1]);
		gl.uniform2f(u_size, size[0], size[1]);
		gl.uniform1f(u_rotate, map._rotate);

		gl.uniform1f(u_alpha, alpha || 1);

		var vertexBuffer = tile._gl_vb = tile._gl_vb || gl.createBuffer();
		var indexBuffer = tile._gl_ib = tile._gl_ib || gl.createBuffer();
		var texcoordBuffer = tile._gl_tcb = tile._gl_tcb || gl.createBuffer();

		self._bufferFloat32Array(gl, vertexBuffer, new Float32Array(pts), a_pt, 2);
		self._bufferFloat32Array(gl, texcoordBuffer, self._tileTextureCoords, a_texcoord, 2);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(u_sampler, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, self._tileIndices, gl.STATIC_DRAW);

		// Draw
		gl.drawElements(gl.TRIANGLES, self._tileIndices.length, gl.UNSIGNED_SHORT, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
	},

	drawLine: function(graphic, graphicOffset, color, alpha, lineWidth, lineCap, lineJoin, dashArray) {
		var self = this;

		var layer = graphic._layer;
		var map = layer._map;

		if (graphic._gl_line_vcount < 2) {
			return;
		}

		var gl = map._gl;
		var camera = map._camera;
		var canvasOffset = map._canvasOffset;
		var canvasScale = map._canvasScale;

		var center = map.getCenter();
		var size = map.getSize();
		var zoomScale = layer._zoomScale || layer._scale;
		var zoomAround = layer._aroundScreen || [];

		var program = gl.lineProgram;
		gl.useProgram(program);

		var u_mv = graphic._gl_l_u_mv = graphic._gl_l_u_mv || gl.getUniformLocation(program, 'u_mv');
		var u_p = graphic._gl_l_u_p = graphic._gl_l_u_p || gl.getUniformLocation(program, 'u_p');
		var u_canvas_offset = graphic._gl_l_u_canvas_offset = graphic._gl_l_u_canvas_offset || gl.getUniformLocation(program, 'u_canvas_offset');

		var u_graphic_offset = graphic._gl_l_u_graphic_offset = graphic._gl_l_u_graphic_offset || gl.getUniformLocation(program, 'u_graphic_offset');

		var u_zoom_around = graphic._gl_l_u_zoom_around = graphic._gl_l_u_zoom_around || gl.getUniformLocation(program, 'u_zoom_around');
		var u_zoom_scale = graphic._gl_l_u_zoom_scale = graphic._gl_l_u_zoom_scale || gl.getUniformLocation(program, 'u_zoom_scale');
		var u_ignore_rotate = graphic._gl_l_u_ignore_rotate = graphic._gl_l_u_ignore_rotate || gl.getUniformLocation(program, 'u_ignore_rotate');

		var u_res = graphic._gl_l_u_res = graphic._gl_l_u_res || gl.getUniformLocation(program, 'u_res');
		var u_center = graphic._gl_l_u_center = graphic._gl_l_u_center || gl.getUniformLocation(program, 'u_center');
		var u_size = graphic._gl_l_u_size = graphic._gl_l_u_size || gl.getUniformLocation(program, 'u_size');
		var u_rotate = graphic._gl_l_u_rotate = graphic._gl_l_u_rotate || gl.getUniformLocation(program, 'u_rotate');

		var a_pt = graphic._gl_l_a_pt = graphic._gl_l_a_pt || gl.getAttribLocation(program, 'a_pt');

		var u_color = graphic._gl_l_u_color = graphic._gl_l_u_color || gl.getUniformLocation(program, 'u_color');

		gl.uniformMatrix4fv(u_mv, false, camera._mvMatrix);
		gl.uniformMatrix4fv(u_p, false, camera._pMatrix);
		gl.uniform2f(u_canvas_offset, canvasOffset[0], canvasOffset[1]);

		gl.uniform2f(u_graphic_offset, graphicOffset[0] || 0, graphicOffset[1] || 0)

		gl.uniform2f(u_zoom_around, zoomAround[0] || 0, zoomAround[1] || 0);
		gl.uniform1f(u_zoom_scale, zoomScale || 1);
		gl.uniform1i(u_ignore_rotate, 1);

		gl.uniform1f(u_res, map._res);
		gl.uniform2f(u_center, center[0], center[1]);
		gl.uniform2f(u_size, size[0], size[1]);
		gl.uniform1f(u_rotate, map._rotate);

		gl.uniform4f(u_color, color[0] / 255, color[1] / 255, color[2] / 255, alpha);

		gl.lineWidth(lineWidth); // TODO WebGL bug, no effect

		var vertexBuffer = graphic._gl_line_vb = graphic._gl_line_vb || gl.createBuffer();
		self._bufferFloat32Array(gl, vertexBuffer, graphic._gl_line_vs, a_pt, 2);

		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

		// Draw
		var first = 0;
		var vcount;
		for (var m = 0, mLen = graphic._gl_line_vcounts.length; m < mLen; m++) {
			vcount = graphic._gl_line_vcounts[m];

			if (vcount > 1) {
				gl.drawArrays(gl.LINE_STRIP, first, vcount);
			}

			first += vcount;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	},

	drawFill: function(graphic, graphicOffset, color, image, imageSize, alpha) {
		var self = this;

		var layer = graphic._layer;
		var map = layer._map;

		if (graphic._gl_fill_vcount < 3) {
			return;
		}

		var gl = map._gl;
		var camera = map._camera;
		var canvasOffset = map._canvasOffset;

		var center = map.getCenter();
		var size = map.getSize();
		var zoomScale = layer._zoomScale || layer._scale;
		var zoomAround = layer._aroundScreen || [];

		var program = gl.fillProgram;
		gl.useProgram(program);

		var u_mv = graphic._gl_f_u_mv = graphic._gl_f_u_mv || gl.getUniformLocation(program, 'u_mv');
		var u_p = graphic._gl_f_u_p = graphic._gl_f_u_p || gl.getUniformLocation(program, 'u_p');
		var u_canvas_offset = graphic._gl_f_u_canvas_offset = graphic._gl_f_u_canvas_offset || gl.getUniformLocation(program, 'u_canvas_offset');

		var u_graphic_offset = graphic._gl_f_u_graphic_offset = graphic._gl_f_u_graphic_offset || gl.getUniformLocation(program, 'u_graphic_offset');

		var u_zoom_around = graphic._gl_f_u_zoom_around = graphic._gl_f_u_zoom_around || gl.getUniformLocation(program, 'u_zoom_around');
		var u_zoom_scale = graphic._gl_f_u_zoom_scale = graphic._gl_f_u_zoom_scale || gl.getUniformLocation(program, 'u_zoom_scale');
		var u_ignore_rotate = graphic._gl_f_u_ignore_rotate = graphic._gl_f_u_ignore_rotate || gl.getUniformLocation(program, 'u_ignore_rotate');

		var u_res = graphic._gl_f_u_res = graphic._gl_f_u_res || gl.getUniformLocation(program, 'u_res');
		var u_center = graphic._gl_f_u_center = graphic._gl_f_u_center || gl.getUniformLocation(program, 'u_center');
		var u_size = graphic._gl_f_u_size = graphic._gl_f_u_size || gl.getUniformLocation(program, 'u_size');
		var u_rotate = graphic._gl_f_u_rotate = graphic._gl_f_u_rotate || gl.getUniformLocation(program, 'u_rotate');

		var a_pt = graphic._gl_f_a_pt = graphic._gl_f_a_pt || gl.getAttribLocation(program, 'a_pt');

		var u_fill_image = graphic._gl_f_u_fill_image = graphic._gl_f_u_fill_image || gl.getUniformLocation(program, 'u_fill_image');
		var u_image_size = graphic._gl_f_u_image_size = graphic._gl_f_u_image_size || gl.getUniformLocation(program, 'u_image_size');
		var u_sampler = graphic._gl_f_u_sampler = graphic._gl_f_u_sampler || gl.getUniformLocation(program, 'u_sampler');
		var a_texcoord = graphic._gl_f_a_texcoord = graphic._gl_f_a_texcoord || gl.getAttribLocation(program, 'a_texcoord');

		var u_alpha = graphic._gl_f_u_alpha = graphic._gl_f_u_alpha || gl.getUniformLocation(program, 'u_alpha');
		var u_color = graphic._gl_f_u_color = graphic._gl_f_u_color || gl.getUniformLocation(program, 'u_color');

		gl.uniformMatrix4fv(u_mv, false, camera._mvMatrix);
		gl.uniformMatrix4fv(u_p, false, camera._pMatrix);
		gl.uniform2f(u_canvas_offset, canvasOffset[0], canvasOffset[1]);

		gl.uniform2f(u_graphic_offset, graphicOffset[0] || 0, graphicOffset[1] || 0);

		gl.uniform2f(u_zoom_around, zoomAround[0] || 0, zoomAround[1] || 0);
		gl.uniform1f(u_zoom_scale, zoomScale || 1);
		gl.uniform1i(u_ignore_rotate, 1);

		gl.uniform1f(u_res, map._res);
		gl.uniform2f(u_center, center[0], center[1]);
		gl.uniform2f(u_size, size[0], size[1]);
		gl.uniform1f(u_rotate, map._rotate);

		gl.uniform1f(u_fill_image, image ? 1 : 0);
		gl.uniform1f(u_alpha, alpha);

		var vertexBuffer = graphic._gl_fill_vb = graphic._gl_fill_vb || gl.createBuffer();
		self._bufferFloat32Array(gl, vertexBuffer, graphic._gl_fill_vs, a_pt, 2);

		if (image) {
			gl.uniform2f(u_image_size, imageSize[0], imageSize[1]);

			self._ensureImageTexture(image, imageSize, map._textureCtx, gl.REPEAT);

			var texture = image._gl_t;
			if (texture) {
				gl.uniform2f(u_image_size, imageSize[0], imageSize[1]);

				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.uniform1i(u_sampler, 0);
			} else {
				return;
			}
		} else {
			gl.uniform4f(u_color, color[0] / 255, color[1] / 255, color[2] / 255, alpha);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

		// Draw
		gl.drawArrays(gl.TRIANGLES, 0, graphic._gl_fill_vcount);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
	},

	drawShapeFill: function(graphic, graphicOffset, shape, shapeSize, offset, color, image, imageSize, alpha, gradual) {
		var self = this;

		var layer = graphic._layer;
		var map = layer._map;

		if (graphic._gl_fill_vcount < 3) {
			return;
		}

		var gl = map._gl;
		var camera = map._camera;
		var canvasOffset = map._canvasOffset;
		var canvasScale = map._canvasScale;

		var center = map.getCenter();
		var size = map.getSize();
		var zoomScale = layer._zoomScale || layer._scale;
		var zoomAround = layer._aroundScreen || [];

		var program = gl.shapeFillProgram;
		gl.useProgram(program);

		var u_mv = graphic._gl_sf_u_mv = graphic._gl_sf_u_mv || gl.getUniformLocation(program, 'u_mv');
		var u_p = graphic._gl_sf_u_p = graphic._gl_sf_u_p || gl.getUniformLocation(program, 'u_p');
		var u_canvas_offset = graphic._gl_sf_u_canvas_offset = graphic._gl_sf_u_canvas_offset || gl.getUniformLocation(program, 'u_canvas_offset');
		var u_canvas_scale = graphic._gl_sf_u_canvas_scale = graphic._gl_sf_u_canvas_scale || gl.getUniformLocation(program, 'u_canvas_scale');

		var u_graphic_offset = graphic._gl_sf_u_graphic_offset = graphic._gl_sf_u_graphic_offset || gl.getUniformLocation(program, 'u_graphic_offset');

		var u_zoom_around = graphic._gl_sf_u_zoom_around = graphic._gl_sf_u_zoom_around || gl.getUniformLocation(program, 'u_zoom_around');
		var u_zoom_scale = graphic._gl_sf_u_zoom_scale = graphic._gl_sf_u_zoom_scale || gl.getUniformLocation(program, 'u_zoom_scale');
		var u_ignore_rotate = graphic._gl_sf_u_ignore_rotate = graphic._gl_sf_u_ignore_rotate || gl.getUniformLocation(program, 'u_ignore_rotate');

		var u_res = graphic._gl_sf_u_res = graphic._gl_sf_u_res || gl.getUniformLocation(program, 'u_res');
		var u_center = graphic._gl_sf_u_center = graphic._gl_sf_u_center || gl.getUniformLocation(program, 'u_center');
		var u_size = graphic._gl_sf_u_size = graphic._gl_sf_u_size || gl.getUniformLocation(program, 'u_size');
		var u_rotate = graphic._gl_sf_u_rotate = graphic._gl_sf_u_rotate || gl.getUniformLocation(program, 'u_rotate');

		var u_shape = graphic._gl_sf_u_shape = graphic._gl_sf_u_shape || gl.getUniformLocation(program, 'u_shape');
		var u_size_x = graphic._gl_sf_u_size_x = graphic._gl_sf_u_size_x || gl.getUniformLocation(program, 'u_size_x');
		var u_size_y = graphic._gl_sf_u_size_y = graphic._gl_sf_u_size_y || gl.getUniformLocation(program, 'u_size_y');
		var u_offset_x = graphic._gl_sf_u_offset_x = graphic._gl_sf_u_offset_x || gl.getUniformLocation(program, 'u_offset_x');
		var u_offset_y = graphic._gl_sf_u_offset_y = graphic._gl_sf_u_offset_y || gl.getUniformLocation(program, 'u_offset_y');
		var a_pt = graphic._gl_sf_a_pt = graphic._gl_sf_a_pt || gl.getAttribLocation(program, 'a_pt');

		var u_fill_image = graphic._gl_sf_u_fill_image = graphic._gl_sf_u_fill_image || gl.getUniformLocation(program, 'u_fill_image');
		var u_image_size = graphic._gl_sf_u_image_size = graphic._gl_sf_u_image_size || gl.getUniformLocation(program, 'u_image_size');
		var u_sampler = graphic._gl_sf_u_sampler = graphic._gl_sf_u_sampler || gl.getUniformLocation(program, 'u_sampler');
		var a_texcoord = graphic._gl_sf_a_texcoord = graphic._gl_sf_a_texcoord || gl.getAttribLocation(program, 'a_texcoord');

		var u_alpha = graphic._gl_sf_u_alpha = graphic._gl_sf_u_alpha || gl.getUniformLocation(program, 'u_alpha');
		var u_color = graphic._gl_sf_u_color = graphic._gl_sf_u_color || gl.getUniformLocation(program, 'u_color');
		var u_color_center = graphic._gl_sf_u_color_center = graphic._gl_sf_u_color_center || gl.getUniformLocation(program, 'u_color_center');

		gl.uniformMatrix4fv(u_mv, false, camera._mvMatrix);
		gl.uniformMatrix4fv(u_p, false, camera._pMatrix);
		gl.uniform2f(u_canvas_offset, canvasOffset[0], canvasOffset[1]);
		gl.uniform2f(u_canvas_scale, canvasScale[0], canvasScale[1]);

		gl.uniform2f(u_graphic_offset, graphicOffset[0] || 0, graphicOffset[1] || 0);

		gl.uniform2f(u_zoom_around, zoomAround[0] || 0, zoomAround[1] || 0);
		gl.uniform1f(u_zoom_scale, zoomScale || 1);
		gl.uniform1i(u_ignore_rotate, 1);

		gl.uniform1f(u_res, map._res);
		gl.uniform2f(u_center, center[0], center[1]);
		gl.uniform2f(u_size, size[0], size[1]);
		gl.uniform1f(u_rotate, map._rotate);

		if (shape == 'circle') {
			gl.uniform1i(u_shape, 1);
		} else if (shape == 'rect') {
			gl.uniform1i(u_shape, 2);
		}
		gl.uniform1f(u_size_x, shapeSize[0] || 0);
		gl.uniform1f(u_size_y, shapeSize[1] || 0);
		gl.uniform1f(u_offset_x, offset[0] || 0);
		gl.uniform1f(u_offset_y, offset[1] || 0);

		gl.uniform1f(u_fill_image, image ? 1 : 0);
		gl.uniform1f(u_alpha, alpha);

		var vertexBuffer = graphic._gl_fill_vb = graphic._gl_fill_vb || gl.createBuffer();
		self._bufferFloat32Array(gl, vertexBuffer, graphic._gl_fill_vs, a_pt, 3);

		if (image) {
			self._ensureImageTexture(image, imageSize, map._textureCtx, gl.REPEAT);

			var texture = image._gl_t;
			if (texture) {
				gl.uniform2f(u_image_size, imageSize[0], imageSize[1]);

				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.uniform1i(u_sampler, 0);
			} else {
				return;
			}
		} else {
			gl.uniform4f(u_color, color[0] / 255, color[1] / 255, color[2] / 255, alpha);
			gl.uniform4f(u_color_center, color[0] / 255, color[1] / 255, color[2] / 255, gradual ? 1.0 : alpha);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

		// Draw
		gl.drawArrays(gl.TRIANGLES, 0, graphic._gl_fill_vcount);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
	},

	drawShapeLine: function(graphic, graphicOffset, shape, shapeSize, offset, color, alpha, lineWidth, lineCap, lineJoin, dashArray) {
		var self = this;

		var layer = graphic._layer;
		var map = layer._map;

		if (!graphic._gl_line_vcounts) {
			return;
		}

		var gl = map._gl;
		var camera = map._camera;
		var canvasOffset = map._canvasOffset;
		var canvasScale = map._canvasScale;

		var center = map.getCenter();
		var size = map.getSize();
		var zoomScale = layer._zoomScale || layer._scale;
		var zoomAround = layer._aroundScreen || [];

		var program = gl.shapeLineProgram;
		gl.useProgram(program);

		var u_mv = graphic._gl_sl_u_mv = graphic._gl_sl_u_mv || gl.getUniformLocation(program, 'u_mv');
		var u_p = graphic._gl_sl_u_p = graphic._gl_sl_u_p || gl.getUniformLocation(program, 'u_p');
		var u_canvas_offset = graphic._gl_sl_u_canvas_offset = graphic._gl_sl_u_canvas_offset || gl.getUniformLocation(program, 'u_canvas_offset');
		var u_canvas_scale = graphic._gl_sl_u_canvas_scale = graphic._gl_sl_u_canvas_scale || gl.getUniformLocation(program, 'u_canvas_scale');

		var u_graphic_offset = graphic._gl_sl_u_graphic_offset = graphic._gl_sl_u_graphic_offset || gl.getUniformLocation(program, 'u_graphic_offset');

		var u_zoom_around = graphic._gl_sl_u_zoom_around = graphic._gl_sl_u_zoom_around || gl.getUniformLocation(program, 'u_zoom_around');
		var u_zoom_scale = graphic._gl_sl_u_zoom_scale = graphic._gl_sl_u_zoom_scale || gl.getUniformLocation(program, 'u_zoom_scale');
		var u_ignore_rotate = graphic._gl_sl_u_ignore_rotate = graphic._gl_sl_u_ignore_rotate || gl.getUniformLocation(program, 'u_ignore_rotate');

		var u_res = graphic._gl_sl_u_res = graphic._gl_sl_u_res || gl.getUniformLocation(program, 'u_res');
		var u_center = graphic._gl_sl_u_center = graphic._gl_sl_u_center || gl.getUniformLocation(program, 'u_center');
		var u_size = graphic._gl_sl_u_size = graphic._gl_sl_u_size || gl.getUniformLocation(program, 'u_size');
		var u_rotate = graphic._gl_sl_u_rotate = graphic._gl_sl_u_rotate || gl.getUniformLocation(program, 'u_rotate');

		var u_shape = graphic._gl_sl_u_shape = graphic._gl_sl_u_shape || gl.getUniformLocation(program, 'u_shape');
		var u_size_x = graphic._gl_sl_u_size_x = graphic._gl_sl_u_size_x || gl.getUniformLocation(program, 'u_size_x');
		var u_size_y = graphic._gl_sl_u_size_y = graphic._gl_sl_u_size_y || gl.getUniformLocation(program, 'u_size_y');
		var u_offset_x = graphic._gl_sl_u_offset_x = graphic._gl_sl_u_offset_x || gl.getUniformLocation(program, 'u_offset_x');
		var u_offset_y = graphic._gl_sl_u_offset_y = graphic._gl_sl_u_offset_y || gl.getUniformLocation(program, 'u_offset_y');
		var a_pt = graphic._gl_sl_a_pt = graphic._gl_sl_a_pt || gl.getAttribLocation(program, 'a_pt');

		var u_color = graphic._gl_sl_u_color = graphic._gl_sl_u_color || gl.getUniformLocation(program, 'u_color');

		gl.uniformMatrix4fv(u_mv, false, camera._mvMatrix);
		gl.uniformMatrix4fv(u_p, false, camera._pMatrix);
		gl.uniform2f(u_canvas_offset, canvasOffset[0], canvasOffset[1]);
		gl.uniform2f(u_canvas_scale, canvasScale[0], canvasScale[1]);

		gl.uniform2f(u_graphic_offset, graphicOffset[0] || 0, graphicOffset[1] || 0);

		gl.uniform2f(u_zoom_around, zoomAround[0] || 0, zoomAround[1] || 0);
		gl.uniform1f(u_zoom_scale, zoomScale || 1);
		gl.uniform1i(u_ignore_rotate, 1);

		gl.uniform1f(u_res, map._res);
		gl.uniform2f(u_center, center[0], center[1]);
		gl.uniform2f(u_size, size[0], size[1]);
		gl.uniform1f(u_rotate, map._rotate);

		if (shape == 'circle') {
			gl.uniform1i(u_shape, 1);
		} else if (shape == 'rect') {
			gl.uniform1i(u_shape, 2);
		}
		gl.uniform1f(u_size_x, shapeSize[0] || 0);
		gl.uniform1f(u_size_y, shapeSize[1] || 0);
		gl.uniform1f(u_offset_x, offset[0] || 0);
		gl.uniform1f(u_offset_y, offset[1] || 0);

		gl.uniform4f(u_color, color[0] / 255, color[1] / 255, color[2] / 255, alpha);

		var vertexBuffer = graphic._gl_line_vb = graphic._gl_line_vb || gl.createBuffer();
		self._bufferFloat32Array(gl, vertexBuffer, graphic._gl_line_vs, a_pt, 3);

		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

		gl.lineWidth(lineWidth); // TODO WebGL bug, lineWidth = 1 ~ 8 only

		// Draw
		var first = 0;
		var vcount;
		for (var m = 0, mLen = graphic._gl_line_vcounts.length; m < mLen; m++) {
			vcount = graphic._gl_line_vcounts[m];

			if (vcount > 1) {
				gl.drawArrays(gl.LINE_STRIP, first, vcount);
			}

			first += vcount;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	},

	drawShapeImage: function(graphic, graphicOffset, image, imageSize, imageOffset, imageRotate) {
		var self = this;

		var layer = graphic._layer;
		var map = layer._map;

		if (graphic._gl_fill_vcount != 12 || !image) {
			return;
		}

		var gl = map._gl;
		var camera = map._camera;
		var canvasOffset = map._canvasOffset;
		var canvasScale = map._canvasScale;

		var center = map.getCenter();
		var size = map.getSize();
		var zoomScale = layer._zoomScale || layer._scale;
		var zoomAround = layer._aroundScreen || [];

		var texture, textureCtx, textureCanvas, textureSize;

		if (image._loaded) {
			self._ensureImageTexture(image, imageSize, map._textureCtx, gl.CLAMP_TO_EDGE);
		} else {
			return;
		}

		texture = image._gl_t;
		if (!texture) {
			return;
		}

		textureSize = image._gl_image_size;
		if (!textureSize) {
			return;
		}

		var program = gl.shapeImageProgram;
		gl.useProgram(program);

		var u_mv = graphic._gl_si_u_mv = graphic._gl_si_u_mv || gl.getUniformLocation(program, 'u_mv');
		var u_p = graphic._gl_si_u_p = graphic._gl_si_u_p || gl.getUniformLocation(program, 'u_p');
		var u_canvas_offset = graphic._gl_si_u_canvas_offset = graphic._gl_si_u_canvas_offset || gl.getUniformLocation(program, 'u_canvas_offset');
		var u_canvas_scale = graphic._gl_si_u_canvas_scale = graphic._gl_si_u_canvas_scale || gl.getUniformLocation(program, 'u_canvas_scale');

		var u_graphic_offset = graphic._gl_si_u_graphic_offset = graphic._gl_si_u_graphic_offset || gl.getUniformLocation(program, 'u_graphic_offset');

		var u_zoom_around = graphic._gl_si_u_zoom_around = graphic._gl_si_u_zoom_around || gl.getUniformLocation(program, 'u_zoom_around');
		var u_zoom_scale = graphic._gl_si_u_zoom_scale = graphic._gl_si_u_zoom_scale || gl.getUniformLocation(program, 'u_zoom_scale');
		var u_ignore_rotate = graphic._gl_si_u_ignore_rotate = graphic._gl_si_u_ignore_rotate || gl.getUniformLocation(program, 'u_ignore_rotate');

		var u_res = graphic._gl_si_u_res = graphic._gl_si_u_res || gl.getUniformLocation(program, 'u_res');
		var u_center = graphic._gl_si_u_center = graphic._gl_si_u_center || gl.getUniformLocation(program, 'u_center');
		var u_size = graphic._gl_si_u_size = graphic._gl_si_u_size || gl.getUniformLocation(program, 'u_size');
		var u_rotate = graphic._gl_si_u_rotate = graphic._gl_si_u_rotate || gl.getUniformLocation(program, 'u_rotate');

		var u_size_x = graphic._gl_si_u_size_x = graphic._gl_si_u_size_x || gl.getUniformLocation(program, 'u_size_x');
		var u_size_y = graphic._gl_si_u_size_y = graphic._gl_si_u_size_y || gl.getUniformLocation(program, 'u_size_y');
		var u_offset_x = graphic._gl_si_u_offset_x = graphic._gl_si_u_offset_x || gl.getUniformLocation(program, 'u_offset_x');
		var u_offset_y = graphic._gl_si_u_offset_y = graphic._gl_si_u_offset_y || gl.getUniformLocation(program, 'u_offset_y');
		var u_image_rotate = graphic._gl_si_u_image_rotate = graphic._gl_si_u_image_rotate || gl.getUniformLocation(program, 'u_image_rotate');
		var u_texture_size = graphic._gl_si_u_texture_size = graphic._gl_si_u_texture_size || gl.getUniformLocation(program, 'u_texture_size');
		var a_pt = graphic._gl_si_a_pt = graphic._gl_si_a_pt || gl.getAttribLocation(program, 'a_pt');

		var u_sampler = graphic._gl_si_u_sampler = graphic._gl_si_u_sampler || gl.getUniformLocation(program, 'u_sampler');
		var a_texcoord = graphic._gl_si_a_texcoord = graphic._gl_si_a_texcoord || gl.getAttribLocation(program, 'a_texcoord');

		var vertexBuffer = graphic._gl_fill_vb = graphic._gl_fill_vb || gl.createBuffer();
		self._bufferFloat32Array(gl, vertexBuffer, graphic._gl_fill_vs, a_pt, 3);

		gl.uniformMatrix4fv(u_mv, false, camera._mvMatrix);
		gl.uniformMatrix4fv(u_p, false, camera._pMatrix);
		gl.uniform2f(u_canvas_offset, canvasOffset[0], canvasOffset[1]);
		gl.uniform2f(u_canvas_scale, canvasScale[0], canvasScale[1]);

		gl.uniform2f(u_graphic_offset, graphicOffset[0] || 0, graphicOffset[1] || 0);

		gl.uniform2f(u_zoom_around, zoomAround[0] || 0, zoomAround[1] || 0);
		gl.uniform1f(u_zoom_scale, zoomScale || 1);
		gl.uniform1i(u_ignore_rotate, 1);

		gl.uniform1f(u_res, map._res);
		gl.uniform2f(u_center, center[0], center[1]);
		gl.uniform2f(u_size, size[0], size[1]);
		gl.uniform1f(u_rotate, map._rotate);

		gl.uniform1f(u_size_x, imageSize[0]);
		gl.uniform1f(u_size_y, imageSize[1]);
		gl.uniform1f(u_offset_x, imageOffset[0] || 0);
		gl.uniform1f(u_offset_y, imageOffset[1] || 0);
		gl.uniform1f(u_image_rotate, imageRotate || 0);
		gl.uniform1f(u_texture_size, textureSize);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(u_sampler, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

		// Draw
		gl.drawArrays(gl.TRIANGLES, 0, graphic._gl_fill_vcount);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
	},

	drawShapeText: function(graphic, graphicOffset, text, textSize, offset, color, alpha, textFont, textStyle, textAlign) {
		var self = this;

		var layer = graphic._layer;
		var map = layer._map;

		if (graphic._gl_fill_vcount != 12 || text == undefined) {
			return;
		}

		var gl = map._gl;
		var camera = map._camera;
		var canvasOffset = map._canvasOffset;
		var canvasScale = map._canvasScale;

		var center = map.getCenter();
		var size = map.getSize();
		var zoomScale = layer._zoomScale || layer._scale;
		var zoomAround = layer._aroundScreen || [];

		var texture, textureCtx, textureCanvas, textureSize, i, iMax, num;
		var textHeight = textSize[0];
		var measuredTextSize;
		var measuredText = graphic._textMeasure;
		if (!graphic._gl_image_data || (text && measuredText != text)) {
			textureCtx = map._textureCtx;

			textureCtx.save();

			textureCtx.font = textStyle + ' ' + textHeight + 'px ' + textFont;
			textureCtx.textBaseline = 'bottom';

			var metrics = textureCtx.measureText(text);
			graphic._textMeasureWidth = metrics.width;
			graphic._textMeasure = text;

			measuredTextSize = graphic._textSize = [metrics.width, textHeight + 2];
			textureSize = self._calcTextureSize(measuredTextSize[0], measuredTextSize[1]);

			textureCanvas = textureCtx.canvas;
			textureCanvas.width = textureSize;
			textureCanvas.height = textureSize;

			// canvas尺寸变化后必须重新设置，否则无效
			textureCtx.fillStyle = color;
			textureCtx.globalAlpha = alpha;
			textureCtx.font = textStyle + ' ' + textHeight + 'px ' + textFont;
			textureCtx.textBaseline = 'bottom';
			textureCtx.fillText(text, 0, measuredTextSize[1] - 1);

			graphic._gl_image_data = textureCtx.getImageData(0, 0, textureSize, textureSize);
			graphic._gl_image_size = textureSize;

			textureCtx.restore();
		}

		if (!graphic._gl_t && graphic._gl_image_data) {
			texture = graphic._gl_t = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, graphic._gl_image_data);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}

		texture = graphic._gl_t;
		if (!texture) {
			return;
		}

		textureSize = graphic._gl_image_size;
		if (!textureSize) {
			return;
		}

		var program = gl.shapeImageProgram;
		gl.useProgram(program);

		var u_mv = graphic._gl_st_u_mv = graphic._gl_st_u_mv || gl.getUniformLocation(program, 'u_mv');
		var u_p = graphic._gl_st_u_p = graphic._gl_st_u_p || gl.getUniformLocation(program, 'u_p');
		var u_canvas_offset = graphic._gl_st_u_canvas_offset = graphic._gl_st_u_canvas_offset || gl.getUniformLocation(program, 'u_canvas_offset');
		var u_canvas_scale = graphic._gl_st_u_canvas_scale = graphic._gl_st_u_canvas_scale || gl.getUniformLocation(program, 'u_canvas_scale');

		var u_graphic_offset = graphic._gl_st_u_graphic_offset = graphic._gl_st_u_graphic_offset || gl.getUniformLocation(program, 'u_graphic_offset');

		var u_zoom_around = graphic._gl_st_u_zoom_around = graphic._gl_st_u_zoom_around || gl.getUniformLocation(program, 'u_zoom_around');
		var u_zoom_scale = graphic._gl_st_u_zoom_scale = graphic._gl_st_u_zoom_scale || gl.getUniformLocation(program, 'u_zoom_scale');
		var u_ignore_rotate = graphic._gl_st_u_ignore_rotate = graphic._gl_st_u_ignore_rotate || gl.getUniformLocation(program, 'u_ignore_rotate');

		var u_res = graphic._gl_st_u_res = graphic._gl_st_u_res || gl.getUniformLocation(program, 'u_res');
		var u_center = graphic._gl_st_u_center = graphic._gl_st_u_center || gl.getUniformLocation(program, 'u_center');
		var u_size = graphic._gl_st_u_size = graphic._gl_st_u_size || gl.getUniformLocation(program, 'u_size');
		var u_rotate = graphic._gl_st_u_rotate = graphic._gl_st_u_rotate || gl.getUniformLocation(program, 'u_rotate');

		var u_size_x = graphic._gl_st_u_size_x = graphic._gl_st_u_size_x || gl.getUniformLocation(program, 'u_size_x');
		var u_size_y = graphic._gl_st_u_size_y = graphic._gl_st_u_size_y || gl.getUniformLocation(program, 'u_size_y');
		var u_offset_x = graphic._gl_st_u_offset_x = graphic._gl_st_u_offset_x || gl.getUniformLocation(program, 'u_offset_x');
		var u_offset_y = graphic._gl_st_u_offset_y = graphic._gl_st_u_offset_y || gl.getUniformLocation(program, 'u_offset_y');
		var u_image_rotate = graphic._gl_st_u_image_rotate = graphic._gl_st_u_image_rotate || gl.getUniformLocation(program, 'u_image_rotate');
		var u_texture_size = graphic._gl_st_u_texture_size = graphic._gl_st_u_texture_size || gl.getUniformLocation(program, 'u_texture_size');
		var a_pt = graphic._gl_st_a_pt = graphic._gl_st_a_pt || gl.getAttribLocation(program, 'a_pt');

		var u_sampler = graphic._gl_st_u_sampler = graphic._gl_st_u_sampler || gl.getUniformLocation(program, 'u_sampler');
		var a_texcoord = graphic._gl_st_a_texcoord = graphic._gl_st_a_texcoord || gl.getAttribLocation(program, 'a_texcoord');

		var vertexBuffer = graphic._gl_fill_vb = graphic._gl_fill_vb || gl.createBuffer();
		self._bufferFloat32Array(gl, vertexBuffer, graphic._gl_fill_vs, a_pt, 3);

		gl.uniformMatrix4fv(u_mv, false, camera._mvMatrix);
		gl.uniformMatrix4fv(u_p, false, camera._pMatrix);
		gl.uniform2f(u_canvas_offset, canvasOffset[0], canvasOffset[1]);
		gl.uniform2f(u_canvas_scale, canvasScale[0], canvasScale[1]);

		gl.uniform2f(u_graphic_offset, graphicOffset[0], graphicOffset[1]);

		gl.uniform2f(u_zoom_around, zoomAround[0] || 0, zoomAround[1] || 0);
		gl.uniform1f(u_zoom_scale, zoomScale || 1);
		gl.uniform1i(u_ignore_rotate, 1);

		gl.uniform1f(u_res, map._res);
		gl.uniform2f(u_center, center[0], center[1]);
		gl.uniform2f(u_size, size[0], size[1]);
		gl.uniform1f(u_rotate, map._rotate);

		measuredTextSize = graphic._textSize;
		gl.uniform1f(u_size_x, measuredTextSize[0]);
		gl.uniform1f(u_size_y, measuredTextSize[1]);
		if (textAlign == 'left') {
			gl.uniform1f(u_offset_x, (offset[0] || 0));
			gl.uniform1f(u_offset_y, (offset[1] || 0) - measuredTextSize[1] / 2);
		} else if (textAlign == 'right') {
			gl.uniform1f(u_offset_x, (offset[0] || 0) - measuredTextSize[0]);
			gl.uniform1f(u_offset_y, (offset[1] || 0) - measuredTextSize[1] / 2);
		} else {
			gl.uniform1f(u_offset_x, (offset[0] || 0) - measuredTextSize[0] / 2);
			gl.uniform1f(u_offset_y, (offset[1] || 0) - measuredTextSize[1] / 2);
		}

		gl.uniform1f(u_image_rotate, 0);
		gl.uniform1f(u_texture_size, textureSize);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(u_sampler, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

		// Draw
		gl.drawArrays(gl.TRIANGLES, 0, graphic._gl_fill_vcount);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
	},

	_calcTextureSize: function(width, height) {
		var textureSize = Math.max(width, height || width);

		var i, iMax, num;
		for (i = 2, iMax = 8; i <= iMax; i++) { // Max 256 Min 4
			num = Math.pow(2, i);
			if (num >= textureSize) {
				textureSize = num;
				break;
			}

			if (i == iMax) {
				textureSize = num;
			}
		}

		return textureSize;
	},

	_ensureImageTexture: function(image, imageSize, textureCtx, wrap) {
		var self = this;

		var texture, textureCanvas, textureSize;

		if (image && image._loaded) {
			if (!image._gl_image_data) {
				textureSize = self._calcTextureSize(imageSize[0], imageSize[1]);

				textureCtx.save();
				textureCanvas = textureCtx.canvas;
				textureCanvas.width = textureSize;
				textureCanvas.height = textureSize;
				textureCtx.clearRect(0, 0, textureSize, textureSize);
				textureCtx.drawImage(image, 0, 0, imageSize[0], imageSize[1]);
				image._gl_image_data = textureCtx.getImageData(0, 0, textureSize, textureSize);
				image._gl_image_size = textureSize;
				textureCtx.restore();
			}

			if (!image._gl_t && image._gl_image_data) {
				texture = image._gl_t = gl.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image._gl_image_data);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
				gl.generateMipmap(gl.TEXTURE_2D);
				gl.bindTexture(gl.TEXTURE_2D, null);
			}
		}
	}


};
/* global G:false */
G.Layer.Graphic = G.Layer.Graphic.extend({

	_update: function() {
		var self = this;
		self._draw();
	},

	_draw: function() {
		var layer = this;
		var map = layer._map;

		var extent = map.getRedrawExtent();
		var searched = layer._tree.search(extent).sort(layer._sortIndex);

		var g, bbox;
		for (var i in searched) {
			g = searched[i];
			bbox = g.bbox;

			if (g._draw && g._layer && G.ExtentUtil.overlaps(bbox, extent) && !g._isVertex) {
				g._draw();
			}
		}
		for (var i in searched) {
			g = searched[i];
			bbox = g.bbox;

			if (g._draw && g._layer && G.ExtentUtil.overlaps(bbox, extent) && g._isVertex) {
				g._draw();
			}
		}
	}


});
/* global G:false */
G.Layer.Tile = G.Layer.Tile.extend({

	_initContainer: function() {
		var self = this;
		var map = self._map;
		var gl = map._gl;

		// self._vertexBuffer = gl.createBuffer();
		// self._indexBuffer = gl.createBuffer();
		// self._textureCoordBuffer = gl.createBuffer();

		self.addListener('tileSuccess', map._requestRedraw, map);
		self.addListener('allLoaded', map._requestRedraw, map);
	},

	_destroyContainer: function() {
		var self = this;
		var map = self._map;
		var gl = map._gl;

		// gl.deleteBuffer(self._vertexBuffer);
		// gl.deleteBuffer(self._indexBuffer);
		// gl.deleteBuffer(self._textureCoordBuffer);

		self.removeListener('tileSuccess', map._requestRedraw, map);
		self.removeListener('allLoaded', map._requestRedraw, map);
	},

	_update: function() {
		var self = this,
			map = self._map;

		if (!map._isLoaded()) {
			return;
		}

		var zoom = self._zoom = self._calcNearestZoom(true),
			tileInfos = self._calcVisTileInfos(true),
			size = map.getSize(),
			center = map.getCenter(),
			options = self.options,
			zoomRes = options.zoomReses[zoom],
			tileSize = options.tileSize,
			drawSize = map.getDrawSize(),
			sizeFactor = 1 + 2 * map.options.canvasExpandFactor,
			w = drawSize[0] * sizeFactor,
			h = drawSize[1] * sizeFactor,
			xmin = center[0] - w * zoomRes / 2,
			xmax = center[0] + w * zoomRes / 2,
			ymin = center[1] - h * zoomRes / 2,
			ymax = center[1] + h * zoomRes / 2,
			extentRedraw = [xmin, ymin, xmax, ymax],
			extentMap = map.options.maxExtent,
			idxX, idxY, tile, tileInfo, tileZoom, tileXmin, tileXmax, tileYmin, tileYmax, tileInExtent, tileRes;

		self._redrawExtent = extentRedraw;
		var extent = G.ExtentUtil.intersect(extentRedraw, extentMap);

		for (var key in self._tiles) {
			tile = self._tiles[key];
			tileInfo = tile._info;
			idxX = tileInfo[0];
			idxY = tileInfo[1];
			tileZoom = tileInfo[2];
			tileRes = options.zoomReses[tileZoom];

			if (tileZoom !== zoom) {
				self._stopLoadingTile(tile);

				if (!options.keepResample || options.opacity < 1) {
					self._removeTile(key);
				}
			}

			tileXmin = options.originX + idxX * tileSize * tileRes;
			tileXmax = options.originX + (idxX + 1) * tileSize * tileRes;
			tileYmin = options.originY - (idxY + 1) * tileSize * tileRes;
			tileYmax = options.originY - idxY * tileSize * tileRes;
			tileInExtent = G.ExtentUtil.overlaps([tileXmin, tileYmin, tileXmax, tileYmax], extent);
			if (!tileInExtent && !self._tileInfoExist(tileInfo, tileInfos)) {
				self._removeTile(key);
			}
		}

		var centerTileIndex = self._calcTileIndex(center[0], center[1], zoom);
		self._sortTileInfos(tileInfos, centerTileIndex[0], centerTileIndex[1]);
		self._addTiles(tileInfos);

		self._draw();
	},

	_draw: function() {
		var self = this;
		var map = self._map;
		var options = self.options;

		var tile, tileInfo, idxX, idxY, tileZoom;
		var zoom = self._zoom;

		var key;

		// Drawing background tiles first
		for (key in self._tiles) {
			tile = self._tiles[key];

			tileInfo = tile._info;
			tileZoom = parseInt(tileInfo[2]);

			if (!tile._loaded || tileZoom === zoom || !options.keepResample || options.opacity < 1) {
				continue;
			}

			idxX = parseInt(tileInfo[0]);
			idxY = parseInt(tileInfo[1]);

			self._placeTile(tile, idxX, idxY, tileZoom);
		}

		// Drawing front tiles
		for (key in self._tiles) {
			tile = self._tiles[key];

			tileInfo = tile._info;
			tileZoom = parseInt(tileInfo[2]);

			if (!tile._loaded || tileZoom !== zoom) {
				continue;
			}

			idxX = parseInt(tileInfo[0]);
			idxY = parseInt(tileInfo[1]);

			self._placeTile(tile, idxX, idxY, tileZoom);
		}
	},

	_placeTile: function(tile, idxX, idxY, tileZoom) {
		if (!tile._loaded) {
			return;
		}

		var self = this,
			mathUtil = G.MathUtil,
			pr = G.Browser.getPxRatio(),
			prX = pr[0],
			prY = pr[1],
			map = self._map,
			rotate = map._rotate,
			mapRes = map._res,
			options = self.options,
			mapOptions = map.options,
			tileSize = options.tileSize,
			zoomRes = options.zoomReses[tileZoom],
			tileMapSize = tileSize * zoomRes,
			tileEnlarge = options.tileEnlarge && (!!(rotate % 90) || G.Browser.gecko || G.Browser.safari),
			scaledTileSize = Math.ceil(tileMapSize / mapRes) + (tileEnlarge ? 2 : 0), // 尝试消除锯齿边缘
			x = options.originX + idxX * tileMapSize,
			y = options.originY - idxY * tileMapSize;

		var zoomScale = self._zoomScale || self._scale;
		var zoomAround = self._aroundScreen;

		if (zoomScale && zoomScale !== 1) {
			scaledTileSize /= zoomScale;
		}

		// Too large texture
		if (scaledTileSize > (tileSize + 2) * 4 || scaledTileSize < tileSize / 8) { // 1024 + 8
			return;
		}

		var tw = scaledTileSize * mapRes,
			th = scaledTileSize * mapRes;

		if (mapOptions.wrap) {
			var iMax = 0,
				iMin = 0;

			var maxExtent = mapOptions.maxExtent;
			var redrawExtent = self._redrawExtent;
			if (redrawExtent && maxExtent) {
				var mapWidth = maxExtent[2] - maxExtent[0];
				iMin = Math.floor((redrawExtent[0] - options.minX) / mapWidth) - 1;
				iMax = Math.ceil((redrawExtent[2] - options.maxX) / mapWidth) + 1;
			}

			for (var i = iMin; i <= iMax; i++) {
				var px = x + i * mapWidth;
				var py = y;

				if (tileEnlarge) {
					px -= mapRes; // 1px
					py += mapRes; // 1px
				}

				var vertices = [
					px, py, //
					px + tw, py, //
					px + tw, py - th, //
					px, py - th
				];

				G.GLDrawUtil.drawTile(self, tile, vertices, options.opacity);
			}
		}
	},

	_addTiles: function(tileInfos) { //[[x1, y1, zoom], [x2, y2, zoom], ...]
		var self = this;

		if (tileInfos.length === 0) {
			return;
		}

		// Clear tile numbers
		self._numLoad = tileInfos.length;
		self._numLoadSuccess = 0;
		self._numLoadError = 0;

		var options = self.options,
			maxZoom = options.zoomReses.length,
			tile, tileInfo, idxX, idxY, tileZoom, key,
			zoomRes;

		var errorUrl = self.options.errorTileUrl || G.Layer.Tile.EMPTY_TILE;

		for (var i = 0, len = tileInfos.length; i < len; i++) {
			tileInfo = tileInfos[i];
			idxX = tileInfo[0];
			idxY = tileInfo[1];
			tileZoom = tileInfo[2];
			zoomRes = options.zoomReses[tileZoom];

			// Check if tile exist.
			key = self._getTileName(idxX, idxY, tileZoom);
			tile = self._tiles[key];

			if (tile) {
				if (tile.src == errorUrl) {
					if (+new Date() - tile._responseTime > options.tileLiveMs) {
						self._loadTile(tile, idxX, idxY, tileZoom);
					}
				} else {
					self._numLoadSuccess++;
				}
			} else {
				tile = self._getIdleTile();
				self._tiles[key] = tile;

				self._loadTile(tile, idxX, idxY, tileZoom);
			}
		}

		self._checkAllHandled();
	},

	_clearBgBuffer: function() {
		var self = this;

		var tile, tileInfo, tileZoom;
		for (var key in self._tiles) {
			tile = self._tiles[key];
			tileInfo = tile._info;
			tileZoom = tileInfo[2];

			if (tileZoom !== self._zoom) {
				self._removeTile(key);
			}
		}
	},

	_onTileRemoved: function(tile) {
		var self = this;
		var map = self._map;
		var gl = map._gl;

		gl.deleteBuffer(tile._gl_vb);
		gl.deleteBuffer(tile._gl_ib);
		gl.deleteBuffer(tile._gl_tcb);
		gl.deleteTexture(tile._gl_t);

		tile._gl_vb = null;
		tile._gl_ib = null;
		tile._gl_tcb = null;
		tile._gl_t = null;
	}


});
/* global G:false */
G.Layer.Label = G.Layer.Graphic.extend({
	mixins: [G.Layer.LOD],

	options: {
		icons: '', // icon's root url
		cluster: [], // ['server1', 'server2']
		crossOrigin: '*'
	},

	init: function(url, options) {
		var self = this;

		G.Layer.Graphic.prototype.init.call(self, options);

		self.url = url;
		self.options = G.Util.merge({}, self.options, options);

		self._lts = {};

		self._gx = self._gy = 10; // Grid x|y size, used for measure label overlap
	},

	_initContainer: function() {
		var self = this;

		G.Layer.Graphic.prototype._initContainer.call(self);
	},

	_onAdded: function() {
		var self = this;

		if (!self._container) {
			self._initContainer();
		}
	},


	_onRemoved: function() {
		var self = this;

		if (self._container) {
			self._destroyContainer();
		}
	},

	_update: function() {
		var self = this,
			map = self._map;

		G.Layer.Graphic.prototype._update.call(self);

		if (!map._isLoaded()) {
			return;
		}

		var zoom = self._zoom = self._calcNearestZoom(true);
		var center = map.getCenter();

		self._clearGrids();

		var zoomAnim = map._zoomAnim;
		if (zoomAnim && zoomAnim._playing) {

		} else {
			var tileInfos = self._calcVisTileInfos();

			var centerTileIndex = self._calcTileIndex(center[0], center[1], zoom);
			self._sortTileInfos(tileInfos, centerTileIndex[0], centerTileIndex[1]);
			self._setLts(tileInfos);
		}

	},

	_setLts: function(tileInfos) { // [[x1, y1, zoom], [x2, y2, zoom], ...]
		var self = this;

		if (!tileInfos.length) {
			return;
		}

		var keys = [],
			key, lt,
			tileInfo, idxX, idxY, tileZoom;
		for (var i = 0, len = tileInfos.length; i < len; i++) {
			tileInfo = tileInfos[i];
			idxX = tileInfo[0];
			idxY = tileInfo[1];
			tileZoom = tileInfo[2];
			key = self._getTileName(idxX, idxY, tileZoom);
			keys.push(key);

			if (key in self._lts) {
				lt = self._lts[key];
				if (!lt.loading) {
					if (!lt.data && !lt.ri) {
						self._loadLtI(idxX, idxY, tileZoom);
					}
				}
			} else {
				self._loadLtI(idxX, idxY, tileZoom);
			}

			self._placeLt(key);
		}

		// Mark unvisible tiles, remove them when visible tiles loaded
		self._dirtyTileKeys = self._dirtyTileKeys || [];
		for (key in self._lts) {
			if (keys.indexOf(key) > -1) {
				continue;
			}

			self._stopLoadingLt(key);
			self._dirtyTileKeys.push(key);
		}
	},

	_checkDirtyTiles: function() {
		var self = this;
		var dirtyTileKeys = self._dirtyTileKeys;

		var key;
		if (dirtyTileKeys && dirtyTileKeys.length > 0) {
			for (var i = 0, len = dirtyTileKeys.length; i < len; i++) {
				key = dirtyTileKeys[i];
				self._removeLt(key);
			}
		}

		self._dirtyTileKeys = [];
	},

	_placeLt: function(key) {
		var self = this,
			lt = self._lts[key];

		if (!lt || !lt._info || !lt.data) {
			return;
		}

		var ils = lt.data.l;
		var id, il, lx, ly, lw, lh, lOffsetX, lOffsetY, lr;
		var data, img, width, height, offsetX, offsetY;
		var pt, imgsKey, imgs, imgKey;
		var g;
		for (id in ils) {
			il = ils[id];
			lx = Number(il[0]);
			ly = Number(il[1]);
			lw = Number(il[2]);
			lh = Number(il[3]);
			lOffsetX = Number(il[4]);
			lOffsetY = Number(il[5]);
			lr = il[6];

			pt = [lx, ly];

			imgsKey = 'imgs' + id;
			imgs = lt[imgsKey];
			for (imgKey in imgs) {
				data = imgs[imgKey];
				img = data[0];
				width = data[1];
				height = data[2];
				offsetX = data[3];
				offsetY = data[4];
				g = data[5];
				if (!g) {
					data[5] = g = new G.Graphic.Point(pt, null, {
						shape: 'image',
						size: [width, height],
						offset: [offsetX, offsetY],
						image: img,
						imageGravity: !!lr
					});

					g.addTo(self);
				}
			}

		}

	},

	_removeLt: function(key) {
		var self = this,
			lt = self._lts[key];

		if (!lt || !lt._info || !lt.data) {
			return;
		}

		self._stopLoadingLt(key);

		var ils = lt.data.l;
		var id;
		var imgData, img;
		var imgsKey, imgs, imgKey;
		for (id in ils) {
			imgsKey = 'imgs' + id;
			imgs = lt[imgsKey];
			for (imgKey in imgs) {
				imgData = imgs[imgKey];
				g = imgData[5];

				if (g) {
					g.remove();
				}
			}
		}

		delete self._lts[key];
	},

	_loadLtI: function(idxX, idxY, zoom) {
		var self = this;

		var key = self._getTileName(idxX, idxY, zoom);
		var lt = self._lts[key] = self._lts[key] || {};

		// Cache tileInfo
		lt._info = [idxX, idxY, zoom];

		// Already tried to load before and got 404 response
		if (lt.data === '') {
			return;
		}

		lt.loading = true;

		var url = self._getTileUrl(idxX, idxY, zoom, {
			d: 'i',
			i: G.Browser.retina ? '@2x' : ''
		});

		var header = {};
		if (self.options.crossOrigin) {
			header.crossOrigin = self.options.crossOrigin;
		}

		var options = {
			responseType: (url.slice(0, 4).toLowerCase() === 'http') ? 'JSONP' : 'JSON',
			header: header,
			success: function(xhr, data) {
				lt.data = data;
				self._processLt(key);
			},
			error: function(xhr) {
				if (xhr.status == 404) { // Does not exist, do not retry anymore
					lt.data = '';
				}
			},
			complete: function() {
				delete lt.ri;
				lt.loading = false;
			}
		};

		if (self.options.crossOrigin) {
			options.responseType = 'JSON';
		}

		var req = G.Util.ajax(url, options);
		lt.ri = req;
	},

	_processLt: function(key) {
		var self = this,
			lt = self._lts[key];

		var data = lt.data;
		if (!data) {
			return;
		}

		var ils = data.l,
			ibs = data.b,
			iis = data.i,
			ibb = data.bb;

		var iconsRoot = self.options.icons || '';

		var il, id, lx, ly, lr;
		var width, height, offsetX, offsetY, dataOffset, dataLen, src;
		var ib, ibo;
		var ii, iio;
		var imgData, img, imgKey;
		var j, jLen;
		for (id in ils) {
			il = ils[id];
			lx = Number(il[0]);
			ly = Number(il[1]);
			lr = il[6];

			if (ibs && id in ibs) {
				ib = ibs[id];
				for (j = 0, jLen = ib.length; j < jLen; j++) {
					ibo = ib[j];
					width = ibo[0];
					height = ibo[1];
					offsetX = ibo[2];
					offsetY = ibo[3];
					dataOffset = ibo[4];
					dataLen = ibo[5];

					if (dataLen == 0 || !ibb) {
						continue;
					}

					imgData = ibb.slice(dataOffset, dataOffset + dataLen);
					img = 'data:image/png;base64,' + imgData;

					imgKey = 'b' + j;
					lt['imgs' + id] = lt['imgs' + id] || {};
					lt['imgs' + id][imgKey] = [img, width, height, offsetX, offsetY];
				}
			}

			if (iis && id in iis) {
				ii = iis[id];
				for (j = 0, jLen = ii.length; j < jLen; j++) {
					iio = ii[j];
					width = iio[0];
					height = iio[1];
					offsetX = iio[2];
					offsetY = iio[3];
					src = iio[4];

					img = iconsRoot + src;

					imgKey = 'i' + j;
					lt['imgs' + id] = lt['imgs' + id] || {};
					lt['imgs' + id][imgKey] = [img, width, height, offsetX, offsetY];
				}
			}
		}

		self._checkDirtyTiles(); // Before display new loaded tile, check dirty tiles to remove
		self._placeLt(key);
	},

	_stopLoadingLt: function(key) {
		var lt = this._lts[key],
			ajaxCancel = G.Util.ajaxCancel;

		if (!lt) {
			return;
		}

		ajaxCancel(lt.ri);
		lt.loading = false;

	},

	_onIconLoad: function() {
		this._dirtyIcons = true;
	},

	_clearGrids: function() {
		this._g = {};
	},

	_hitGrids: function(gxmin, gymin, gxmax, gymax) {
		var self = this;
		var gkey;
		for (var i = gxmin; i <= gxmax; i++) {
			for (var j = gymin; j <= gymax; j++) {
				gkey = i + ',' + j;
				if (self._g[gkey]) {
					return true;
				}
			}
		}

		return false;
	},

	_markGrids: function(gxmin, gymin, gxmax, gymax) {
		var self = this;
		var gkey;
		for (var i = gxmin; i <= gxmax; i++) {
			for (var j = gymin; j <= gymax; j++) {
				gkey = i + ',' + j;
				self._g[gkey] = true;
			}
		}

	}


});
/* global G:false */
G.Layer.FeatureService = G.Layer.Graphic.extend({
	mixins: [G.Layer.LOD],

	options: {
		mode: 'all', // tile | all
		vacuumCount: 1000 // Vacuum when graphics count is greater than it, only useful when mode is 'tile'
	},

	init: function(reqFunc, options) { // reqFunc=function(extent){}, extent is undefined if mode is 'all'
		var self = this;

		G.Layer.Graphic.prototype.init.call(self, options);

		self.options = G.Util.merge({}, self.options, options);

		self._reqFunc = reqFunc;

		self._loadingKeys = {};
	},

	onSuccess: function(extent) {
		var self = this;

		if (self.options.mode == 'tile') {
			self.fireEvent('loadTileSuccess', {
				extent: extent
			});
		} else {
			self.fireEvent('loadAllSuccess');
		}
	},

	onError: function(extent) {
		var self = this;

		if (self.options.mode == 'tile') {
			self.fireEvent('loadTileError', {
				extent: extent
			});
		} else {
			self.fireEvent('loadAllError');
		}
	},

	onComplete: function(extent) {
		var self = this;

		if (self.options.mode == 'tile') {
			var key = extent.join(',');
			delete self._loadingKeys[key];

			self.fireEvent('loadTileComplete', {
				extent: extent
			});
		} else {
			self.fireEvent('loadAllComplete');
		}
	},

	_update: function() {
		var self = this,
			map = self._map;

		G.Layer.Graphic.prototype._update.call(self);

		if (!map._isLoaded()) {
			return;
		}

		if (self.options.mode == 'tile') {
			var count = self.count();
			if (count > self.options.vacuumCount) {
				self._vacuum();
			}

			var tileInfos = self._calcVisTileInfos();
			self._addFts(tileInfos);
		} else {
			self._loadAll();
		}
	},

	_addFts: function(tileInfos) { // [[x1, y1, zoom], [x2, y2, zoom], ...]
		var self = this;

		if (tileInfos.length === 0) {
			return;
		}

		var i, len;
		var key, req;
		var tileInfo, idxX, idxY, tileZoom, extent;
		var loadingKeys = self._loadingKeys;
		var keys = {};
		for (i = 0, len = tileInfos.length; i < len; i++) {
			tileInfo = tileInfos[i];
			idxX = tileInfo[0];
			idxY = tileInfo[1];
			tileZoom = tileInfo[2];
			extent = self._calcTileExtent(idxX, idxY, tileZoom);

			key = extent.join(',');
			keys[key] = extent;
		}

		for (key in loadingKeys) {
			if (!keys[key]) {
				req = loadingKeys[key];
				G.Util.ajaxCancel(req);
				delete loadingKeys[key];
			}
		}

		for (key in keys) {
			extent = keys[key];
			self._loadFt(extent);
		}
	},

	_loadFt: function(extent) {
		var self = this;
		var key = extent.join(',');
		var reqFunc = self._reqFunc;

		if (key in self._loadingKeys) {
			return;
		}

		if (!reqFunc) {
			return;
		}

		var req = reqFunc.call(self, extent);
		self._loadingKeys[key] = req;

		self.fireEvent('loadTileStart', {
			extent: extent
		});
	},

	_loadAll: function() {
		var self = this;
		var key = 'all';
		var reqFunc = self._reqFunc;

		if (key in self._loadingKeys) {
			return;
		}

		if (!reqFunc) {
			return;
		}

		var req = reqFunc.call(self);
		self._loadingKeys[key] = req;

		self.fireEvent('loadAllStart');
	}



});
/* global G:false */
G.Layer.GeoHeyFeature = G.Layer.FeatureService.extend({

	options: {
		apiKey: '',
		where: '1=1',
		outFields: '',
		limit: 1000
	},

	init: function(url, options) {
		var self = this;

		var func = function(extent) {
			var _url = url + '/query';
			var layerOptions = self.options;
			var data = {
				ak: layerOptions.apiKey,
				where: layerOptions.where,
				outFields: layerOptions.outFields,
				limit: layerOptions.limit
			};

			if (extent) {
				data.geometry = JSON.stringify(extent);
			}

			var reqOptions = {
				responseType: (_url.slice(0, 4).toLowerCase() === 'http') ? 'JSONP' : 'JSON',
				data: data,
				success: function(xhr, obj) {
					var data = obj.data;
					var geometryType = data.geometryType;
					var features = data.features;
					if (features) {
						var i, maxI = features.length - 1,
							minI = Math.max(0, maxI - layerOptions.limit),
							feature, fid, geom, attrs, id, gs = [],
							j, g;
						for (i = maxI; i >= minI; i--) {
							feature = features[i];
							fid = feature.id;
							geom = feature.geom;
							attrs = feature.attrs || {};

							if (geometryType == 'Point') {
								gs.push(new G.Graphic.Point(geom, attrs));
							} else if (geometryType == 'Polyline') {
								gs.push(new G.Graphic.Polyline(geom, attrs));
							} else if (geometryType == 'Polygon') {
								gs.push(new G.Graphic.Polygon(geom, attrs));
							} else if (geometryType == 'MultiPoint') {
								gs.push(new G.Graphic.MultiPoint(geom, attrs));
							} else if (geometryType == 'MultiPolyline') {
								gs.push(new G.Graphic.MultiPolyline(geom, attrs));
							} else if (geometryType == 'MultiPolygon') {
								gs.push(new G.Graphic.MultiPolygon(geom, attrs));
							}

							for (j in gs) {
								g = gs[j];
								if (!g) {
									continue;
								}

								id = fid + '_' + j;
								if (self.get(id)) {
									continue;
								} else {
									g.addTo(self, id);
								}
							}

						}
					}

					self.onSuccess(extent);
				},
				error: function() {
					self.onError(extent);
				},
				complete: function() {
					self.onComplete(extent);
				}
			};

			G.Util.ajax(_url, reqOptions);
		};

		G.Layer.FeatureService.prototype.init.call(self, func, options);
	}



});
/* global G:false */
G.Layer.GeoHeyProgressiveFeature = G.Layer.Graphic.extend({

	options: {
		stepFactor: 4,
		stepCount: 4,
		tolerance: 8,
		outFields: '[]'
	},

	init: function(url, options) {
		var self = this;

		G.Layer.Graphic.prototype.init.call(self, options);

		self.url = url;
	},

	onSuccess: function(extent) {
		this.fireEvent('extentSuccess', {
			extent: extent
		});
	},

	onError: function(extent) {
		this.fireEvent('extentError', {
			extent: extent
		});
	},

	onComplete: function(extent) {
		var self = this;

		self.fireEvent('extentComplete', {
			extent: extent
		});
	},

	_update: function() {
		var self = this,
			map = self._map;

		var res = self._loadRes = map._res;
		var extent = self._loadExtent = map.getExtent();

		var loadedStatus = self._loadedStatus;
		if (loadedStatus && res == loadedStatus[0] && G.ExtentUtil.equals(extent, loadedStatus[1])) {
			return;
		}

		G.Layer.Graphic.prototype._update.call(self);

		if (!map._isLoaded()) {
			return;
		}

		var req = self._req;
		if (req) {
			G.Util.ajaxCancel(req);
		}

		// Mark dirty
		var g, i;
		var graphics = self._graphics;
		for (i in graphics) {
			g = graphics[i];
			g._dirty = true;
		}

		self._loadStep(1);
	},

	_loadStep: function(step) {
		var self = this;
		var options = self.options;

		var loadRes = self._loadRes;
		var loadExtent = self._loadExtent;

		var cellPixel = options.tolerance * Math.pow(options.stepFactor, (options.stepCount - step));
		var url = self.url + '/filter';

		var reqOptions = {
			//responseType: (url.slice(0, 4).toLowerCase() === 'http') ? 'JSONP' : 'JSON',
			responseType: 'JSON', //test
			data: {
				extent: JSON.stringify(loadExtent),
				excludeExtents: JSON.stringify([]),
				res: loadRes,
				cellPixel: cellPixel,
				outFields: options.outFields
			},
			success: function(xhr, data) {
				self._processResult(step, data);
			},
			complete: function() {
				self._req = null;
			}
		};

		self._req = G.Util.ajax(url, reqOptions);
	},

	_processResult: function(step, data) {
		var self = this;
		var options = self.options;

		var loadRes = self._loadRes;
		var loadExtent = self._loadExtent;

		var cellPixel = options.tolerance * Math.pow(options.stepFactor, (options.stepCount - step));
		var realRes = loadRes * cellPixel;

		var geometryType = data.geometryType;
		var features = data.features;
		if (!features) {
			self.onError(loadExtent);
			self.onComplete(loadExtent);
			return;
		}

		var i, maxI = features.length - 1,
			feature, fid, geom, attrs,
			partKey, partGeom,
			g;
		for (i = maxI; i >= 0; i--) {
			feature = features[i];
			fid = feature.id;
			geom = feature.geom;
			attrs = feature.attrs || {};

			if (geometryType == 'Point') {
				g = new G.Graphic.Point(geom, attrs);
				self._updateGraphic(realRes, fid, 0, g);
			} else if (geometryType == 'Polyline') {
				g = new G.Graphic.Polyline(geom, attrs);
				self._updateGraphic(realRes, fid, 0, g);
			} else if (geometryType == 'Polygon') {
				g = new G.Graphic.Polygon(geom, attrs);
				self._updateGraphic(realRes, fid, 0, g);
			} else if (geometryType == 'MultiPoint') {
				for (partKey in geom.multi) {
					partGeom = geom.multi[partKey];
					g = new G.Graphic.Point(partGeom, attrs);
					self._updateGraphic(realRes, fid, partKey, g);
				}
			} else if (geometryType == 'MultiPolyline') {
				for (partKey in geom.multi) {
					partGeom = geom.multi[partKey];
					g = new G.Graphic.Polyline(partGeom, attrs);
					self._updateGraphic(realRes, fid, partKey, g);
				}
			} else if (geometryType == 'MultiPolygon') {
				for (partKey in geom.multi) {
					partGeom = geom.multi[partKey];
					g = new G.Graphic.Polygon(partGeom, attrs);
					self._updateGraphic(realRes, fid, partKey, g);
				}
			}

		}

		if (step < options.stepCount) {
			self._loadStep(step + 1);
		} else {
			self._clearDirty();
			self._loadedStatus = [loadRes, loadExtent];

			self.onSuccess(loadExtent);
			self.onComplete(loadExtent);
		}

	},

	_updateGraphic: function(res, fid, partKey, g) {
		var self = this;
		var id = fid + (partKey ? '_' + partKey : '');
		var old = self.get(id);
		if (old) {
			if (res < old._res) {
				old.updateGeom(g.geom, true);
				old._res = res;
			}

			old._dirty = false;
		} else {
			g._res = res;
			g.addTo(self, id);
		}
	},

	_clearDirty: function() {
		var self = this;
		var graphics = self._graphics;

		var g, i;
		for (i in graphics) {
			g = graphics[i];
			if (g._dirty) {
				g.remove();
			}
		}
	}



});
/* global G:false */
G.Layer.TiledService = G.Layer.extend({
	mixins: [G.Layer.LOD],

	init: function(reqFunc, options) { // reqFunc=function(x, y, zoom){}
		var self = this;

		self.options = G.Util.merge({}, self.options, options);

		self._reqFunc = reqFunc;

		self._loadingKeys = {};
		self._loadedKeys = {};
	},

	onSuccess: function(tileInfo, data) {
		var self = this;

		self._numLoadSuccess++;

		var idxX = parseInt(tileInfo[0]);
		var idxY = parseInt(tileInfo[1]);
		var tileZoom = parseInt(tileInfo[2]);
		var key = self._getTileName(idxX, idxY, tileZoom);
		self._loadedKeys[key] = tileInfo;

		self.fireEvent('loadTileSuccess', {
			tileInfo: tileInfo,
			data: data
		});
	},

	onError: function(tileInfo) {
		var self = this;

		self._numLoadError++;

		self.fireEvent('loadTileError', {
			tileInfo: tileInfo
		});
	},

	onComplete: function(tileInfo) {
		var self = this;

		var idxX = parseInt(tileInfo[0]);
		var idxY = parseInt(tileInfo[1]);
		var tileZoom = parseInt(tileInfo[2]);
		var key = self._getTileName(idxX, idxY, tileZoom);
		delete self._loadingKeys[key];

		self.fireEvent('loadTileComplete', {
			tileInfo: tileInfo
		});

		self._checkAllHandled();
	},

	_update: function() {
		var self = this,
			map = self._map;

		if (!map._isLoaded()) {
			return;
		}

		var i, len;
		var key;
		var tileInfo, idxX, idxY, tileZoom;
		var tileInfos = self._calcVisTileInfos();
		var keys = {};
		for (i = 0, len = tileInfos.length; i < len; i++) {
			tileInfo = tileInfos[i];
			idxX = tileInfo[0];
			idxY = tileInfo[1];
			tileZoom = tileInfo[2];
			key = self._getTileName(idxX, idxY, tileZoom);

			keys[key] = tileInfo;
		}
		self._addTiles(keys);

		for (key in self._loadedKeys) {
			if (!keys[key]) {
				tileInfo = self._loadedKeys[key];
				delete self._loadedKeys[key];

				self.fireEvent('unusedTile', {
					tileInfo: tileInfo
				});
			}
		}

		self._onUpdated();
	},

	_addTiles: function(keys) {
		var self = this;

		var key, req;
		var loadingKeys = self._loadingKeys;
		var tileInfo;
		for (key in loadingKeys) {
			if (!keys[key]) {
				req = loadingKeys[key];
				G.Util.ajaxCancel(req);
				delete loadingKeys[key];
			}
		}

		self._numLoad = Object.keys(keys).length;
		self._numLoadSuccess = 0;
		self._numLoadError = 0;

		for (key in keys) {
			tileInfo = keys[key];
			self._loadTile(tileInfo);
		}

		self._checkAllHandled(); // 可能不需要加载
	},

	_loadTile: function(tileInfo) {
		var self = this;
		var reqFunc = self._reqFunc;

		var idxX = parseInt(tileInfo[0]);
		var idxY = parseInt(tileInfo[1]);
		var tileZoom = parseInt(tileInfo[2]);
		var key = self._getTileName(idxX, idxY, tileZoom);

		if (key in self._loadingKeys) {
			return;
		}

		if (!reqFunc) {
			return;
		}

		if (key in self._loadedKeys) {
			self._numLoadSuccess++;
			return;
		}


		var req = reqFunc.call(self, idxX, idxY, tileZoom);
		self._loadingKeys[key] = req;

		self.fireEvent('loadTileStart', {
			tileInfo: tileInfo
		});
	},

	_stopLoadingByKey: function(key) {
		var loadingKeys = this._loadingKeys;
		var req = loadingKeys[key];

		if (!req) {
			return;
		}

		G.Util.ajaxCancel(req);
		delete loadingKeys[key];
	},

	_checkAllHandled: function() {
		var self = this;

		if (self._numLoad == self._numLoadSuccess + self._numLoadError) {
			self.fireEvent('allLoaded');
		}
	},

	_onUpdated: function() {}


});
/* global G:false */
G.Graphic.Arrow = G.Graphic.Arrow.extend({

	_onAdded: function() {
		var self = this;
		var map = self._layer._map;

		self._resGl = null;

		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var self = this;
		var map = self._layer._map;
		var gl = map._gl;

		gl.deleteBuffer(self._gl_fill_vb);
		self._gl_fill_vb = null;

		var fakeLineGraphics = self._fakeLineGraphics || [];
		var i, iLen, fakeG;
		for (i = 0, iLen = fakeLineGraphics.length; i < iLen; i++) {
			fakeG = fakeLineGraphics[i];

			gl.deleteBuffer(fakeG._gl_line_vb);
			fakeG._gl_line_vb = null;
		}

		if (map) {
			map._requestRedraw();
		}
	},

	_onGeomUpdated: function() {
		var self = this;

		self._resDraw = null;
		self._resGl = null;

		var layer = self._layer;
		if (!layer) {
			return;
		}

		var map = layer._map;
		if (!map) {
			return;
		}

		self._updateGeomDraw(map._res);
		self._ensureGl();
	},

	_ensureGl: function() {
		var self = this;

		var layer = self._layer;
		if (!layer) {
			return;
		}

		var map = layer._map;
		if (!map) {
			return;
		}

		if (self._resGl == map._res) {
			return;
		}

		var geom = self._geomDraw;
		if (!geom) {
			return;
		}

		var i, iLen, j, jLen;
		var part, pt, lastPt;


		// Triangulation
		var contour, hole;

		part = geom[0];
		contour = [];
		lastPt = null;
		for (j = 0, jLen = part.length; j < jLen; j++) {
			pt = part[j];
			if (lastPt && lastPt[0] == pt[0] && lastPt[1] == pt[1]) {
				continue;
			}

			if (j == jLen - 1 && pt[0] == part[0][0] && pt[1] == part[0][1]) {
				continue;
			}

			contour.push(new poly2tri.Point(pt[0], pt[1]));
			lastPt = pt;
		}
		var swctx = new poly2tri.SweepContext(contour);

		for (i = 1, iLen = geom.length; i < iLen; i++) {
			part = geom[i];
			hole = [];
			lastPt = null;
			for (j = 0, jLen = part.length; j < jLen; j++) {
				pt = part[j];
				if (lastPt && lastPt[0] == pt[0] && lastPt[1] == pt[1]) {
					continue;
				}

				if (j == jLen - 1 && pt[0] == part[0][0] && pt[1] == part[0][1]) {
					continue;
				}

				hole.push(new poly2tri.Point(pt[0], pt[1]));
				lastPt = pt;
			}
			swctx.addHole(hole);
		}
		try {
			swctx.triangulate();
		} catch (e) {}

		var triangles = swctx.getTriangles();

		var fillVertices = [];
		var tri, triPt;
		for (i = 0, iLen = triangles.length; i < iLen; i++) {
			tri = triangles[i];

			for (j = 0; j < 3; j++) {
				triPt = tri.getPoint(j);
				fillVertices.push(triPt.x);
				fillVertices.push(triPt.y);
			}
		}

		self._gl_fill_vs = new Float32Array(fillVertices);
		self._gl_fill_vcount = fillVertices.length / 2;

		var fakeLineGraphics = self._fakeLineGraphics = []; // 用于渲染outline的伪Graphic.Polyline对象
		var fakeG, lineVertices;
		for (i = 0, iLen = geom.length; i < iLen; i++) {
			part = geom[i];

			fakeG = {};

			lineVertices = [];
			for (j = 0, jLen = part.length; j < jLen; j++) {
				pt = part[j];
				lineVertices.push(pt[0]);
				lineVertices.push(pt[1]);
			}
			pt = part[0];
			lineVertices.push(pt[0]);
			lineVertices.push(pt[1]);

			fakeG._gl_line_vs = new Float32Array(lineVertices);
			fakeG._gl_line_vcounts = [lineVertices.length / 2];

			fakeLineGraphics.push(fakeG);
		}

		self._resGl = map._res;
	},

	_draw: function() {
		var self = this;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;

		self._updateGeomDraw(map._res);
		self._ensureGl();

		if (!self._geomDraw || !self._fakeLineGraphics) {
			return;
		}

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		for (var m = range[0]; m <= range[1]; m++) {
			var graphicOffset = [m * mapWidth, 0];

			if (options.fill) {
				if (options.fillImage) {
					var imgSrc = G.Browser.getImageSrc(options.fillImage);
					var img = G.DomUtil.getImgElement(imgSrc, function() {
						map._requestRedraw();
					}, null, '*');

					if (img._loaded) {
						var imageSize = options.fillImageSize;
						G.GLDrawUtil.drawFill(self, graphicOffset, null, img, imageSize, options.fillOpacity);
					}
				} else {
					G.GLDrawUtil.drawFill(self, graphicOffset, G.Util.colorRgb(options.fillColor), null, null, options.fillOpacity);
				}
			}

			if (options.outline || self._mouseOver || self._editing) {
				var lineColor = self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor);
				var lineCap = options.outlineCap;
				var lineJoin = options.outlineJoin;
				var lineWidth = (options.outline ? options.outlineWidth : 0) + (self._mouseOver ? options.lineHighlightWiden : 0);
				var lineOpacity = options.outlineOpacity;
				var lineDashArray = options.outlineDashArray;

				var fakeLineGraphics = self._fakeLineGraphics;
				var i, iLen, fakeG;
				for (i = 0, iLen = fakeLineGraphics.length; i < iLen; i++) {
					fakeG = fakeLineGraphics[i];
					fakeG._layer = layer; // GLDrawUtil中会使用
					G.GLDrawUtil.drawLine(fakeG, graphicOffset, G.Util.colorRgb(lineColor), lineOpacity, lineWidth, lineCap, lineJoin, lineDashArray);
				}
			}
		}

	},

	_drawMask: function() {
		var self = this;
		var map = self._map;

		var ctx = map._maskCtx;

		self._updateGeomDraw(map._res);

		var geom = self._geomDraw;
		var method;
		var part, pt;

		var canvasOffset = map._canvasOffset;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		for (var m = range[0]; m <= range[1]; m++) {
			var graphicOffset = [m * mapWidth, 0];

			ctx.beginPath();

			for (var i = 0, iLen = geom.length; i < iLen; i++) {
				part = geom[i];

				for (var j = 0, jLen = part.length; j < jLen; j++) {
					pt = part[j];
					pt = map.toScreen([pt[0] + graphicOffset[0], pt[1]]);

					method = j === 0 ? 'moveTo' : 'lineTo';
					ctx[method](pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
				}

				pt = part[0];
				pt = map.toScreen([pt[0] + graphicOffset[0], pt[1]]);
				ctx.lineTo(pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
			}

			ctx.fill();
		}
	},

	_onStartEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		for (i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], graphic._onVertexDragStart, graphic);
		}

		graphic._refreshVertexes();
	},

	_onEndEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		var i, downType;
		for (i in virtualMouse.DOWN) {
			downType = virtualMouse.DOWN[i];
			map.removeListener(downType, graphic._onVertexDragStart, graphic);
			map.removeListener(virtualMouse.MOVE[downType], graphic._onVertexDrag, graphic);
			map.removeListener(virtualMouse.UP[downType], graphic._onVertexDragEnd, graphic);
		}

		graphic._removeVertexes();

		G.DomUtil.removeClass(map._layersFrame, 'g-edit');

		map._requestRedraw();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		map._requestRedraw();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		map._requestRedraw();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}



});
/* global G:false */
G.Graphic.Circle = G.Graphic.Circle.extend({

	_onAdded: function() {
		var self = this;
		var map = self._layer._map;

		self._ensureGl();

		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var self = this;
		var map = self._layer._map;
		var gl = map._gl;

		gl.deleteBuffer(self._gl_fill_vb);
		self._gl_fill_vb = null;

		gl.deleteBuffer(self._gl_line_vb);
		self._gl_line_vb = null;

		if (map) {
			map._requestRedraw();
		}
	},

	_onGeomUpdated: function() {
		this._ensureGl();
	},

	_ensureGl: function() {
		var self = this;

		var geom = self.geom;
		if (!geom) {
			return;
		}

		var x = geom[0];
		var y = geom[1];

		var fillVertices = [];
		var lineVertices = [];

		var i, iLen = 48;
		for (i = 0; i < iLen; i++) {
			fillVertices.push(x);
			fillVertices.push(y);
			fillVertices.push(-1); // Center

			fillVertices.push(x);
			fillVertices.push(y);
			fillVertices.push(i / iLen); // Point 1

			fillVertices.push(x);
			fillVertices.push(y);
			fillVertices.push((i + 1) / iLen); // Point 2

			lineVertices.push(x);
			lineVertices.push(y);
			lineVertices.push(i / iLen); // Point 1
		}

		lineVertices.push(x);
		lineVertices.push(y);
		lineVertices.push(0); // Point 1

		self._gl_fill_vs = new Float32Array(fillVertices);
		self._gl_fill_vcount = fillVertices.length / 3;

		self._gl_line_vs = new Float32Array(lineVertices);
		self._gl_line_vcounts = [lineVertices.length / 3];
	},

	_draw: function() {
		var self = this;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;

		var d = self.geom[2] / map._res * 2;
		if (!d) {
			return;
		}

		var range = map._calcWrapPointRange(self.geom) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		for (var m = range[0]; m <= range[1]; m++) {
			var graphicOffset = [m * mapWidth, 0];

			if (options.fill) {
				if (options.fillImage) {
					var imgSrc = G.Browser.getImageSrc(options.fillImage);
					var img = G.DomUtil.getImgElement(imgSrc, function() {
						map._requestRedraw();
					}, null, '*');

					if (img._loaded) {
						var imageSize = options.fillImageSize;
						G.GLDrawUtil.drawShapeFill(self, graphicOffset, 'circle', [d, 0], [0, 0], null, img, imageSize, options.fillOpacity);
					}
				} else {
					G.GLDrawUtil.drawShapeFill(self, graphicOffset, 'circle', [d, 0], [0, 0], G.Util.colorRgb(options.fillColor), null, null, options.fillOpacity, options.gradual);
				}
			}

			if (options.outline || self._mouseOver) {
				var lineColor = self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor);
				var lineWidth = self._mouseOver ? options.outlineWidth + options.lineHighlightWiden : options.outlineWidth;
				var lineOpacity = options.outlineOpacity;
				var lineDashArray = options.outlineDashArray;

				G.GLDrawUtil.drawShapeLine(self, graphicOffset, 'circle', [d, 0], [0, 0], G.Util.colorRgb(lineColor), lineOpacity, lineWidth, null, null, lineDashArray);
			}
		}

	},

	_drawMask: function() {
		var self = this;
		var map = self._map;

		var ctx = map._maskCtx;

		var res = map._res;

		var geom = self.geom;
		var cx = geom[0];
		var cy = geom[1];
		var r = geom[2];

		var size = r / res;

		var canvasOffset = map._canvasOffset;

		var range = map._calcWrapPointRange(geom) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		for (var m = range[0]; m <= range[1]; m++) {
			var c = map.toScreen([cx + m * mapWidth, cy]);

			c[0] += canvasOffset[0];
			c[1] += canvasOffset[1];

			ctx.beginPath();
			ctx.arc(c[0], c[1], size, 0, 2 * Math.PI, false);
			ctx.fill();
		}
	},

	_onStartEdit: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], self._onVertexDragStart, self);
		}

		self._refreshVertexes();
	},

	_onEndEdit: function() {
		var self = this;
		var map = self._layer._map;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.DOWN) {
			map.removeListener(virtualMouse.DOWN[i], self._onVertexDragStart, self);
		}

		self._removeVertexes();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		map._requestRedraw();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		map._requestRedraw();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}


});
/* global G:false */
G.Graphic.Group = G.Graphic.Group.extend({

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		map._requestRedraw();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		map._requestRedraw();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}


});
/* global G:false */
G.Graphic.MultiPoint = G.Graphic.MultiPoint.extend({

	_onAdded: function() {
		var self = this;
		var map = self._layer._map;

		self._ensureGl();

		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var self = this;
		var map = self._layer._map;
		var gl = map._gl;

		gl.deleteBuffer(self._gl_fill_vb);
		self._gl_fill_vb = null;

		gl.deleteBuffer(self._gl_line_vb);
		self._gl_line_vb = null;

		if (map) {
			map._requestRedraw();
		}
	},

	_onGeomUpdated: function() {
		this._ensureGl();
	},

	_ensureGl: function() {
		var self = this;
		var options = self.options;

		var shape = options.shape;

		var geom = self.geom;
		if (!geom || !geom['m']) {
			return;
		}

		var points = geom['m'];
		var pt, x, y;
		var i, iLen;

		var fillVertices = [];
		var lineVertices = [];

		var lineVcountTotal = 0;
		self._gl_line_vcounts = self._gl_line_vcounts || [];

		for (var m = 0, mLen = points.length; m < mLen; m++) {
			pt = points[m];
			x = pt[0];
			y = pt[1];

			if (shape == 'rect') {
				self._pushVertex(fillVertices, x, y, 0); // Center
				self._pushVertex(fillVertices, x, y, 1);
				self._pushVertex(fillVertices, x, y, 2);
				self._pushVertex(fillVertices, x, y, 0); // Center
				self._pushVertex(fillVertices, x, y, 2);
				self._pushVertex(fillVertices, x, y, 3);
				self._pushVertex(fillVertices, x, y, 0); // Center
				self._pushVertex(fillVertices, x, y, 3);
				self._pushVertex(fillVertices, x, y, 4);
				self._pushVertex(fillVertices, x, y, 0); // Center
				self._pushVertex(fillVertices, x, y, 4);
				self._pushVertex(fillVertices, x, y, 1);

				self._pushVertex(lineVertices, x, y, 1);
				self._pushVertex(lineVertices, x, y, 2);
				self._pushVertex(lineVertices, x, y, 3);
				self._pushVertex(lineVertices, x, y, 4);
				self._pushVertex(lineVertices, x, y, 1);
			} else if (shape == 'image') {
				self._pushVertex(fillVertices, x, y, 0); // Center
				self._pushVertex(fillVertices, x, y, 1);
				self._pushVertex(fillVertices, x, y, 2);
				self._pushVertex(fillVertices, x, y, 0); // Center
				self._pushVertex(fillVertices, x, y, 2);
				self._pushVertex(fillVertices, x, y, 3);
				self._pushVertex(fillVertices, x, y, 0); // Center
				self._pushVertex(fillVertices, x, y, 3);
				self._pushVertex(fillVertices, x, y, 4);
				self._pushVertex(fillVertices, x, y, 0); // Center
				self._pushVertex(fillVertices, x, y, 4);
				self._pushVertex(fillVertices, x, y, 1);
			} else if (shape == 'text') {
				self._pushVertex(fillVertices, x, y, 0); // Center
				self._pushVertex(fillVertices, x, y, 1);
				self._pushVertex(fillVertices, x, y, 2);
				self._pushVertex(fillVertices, x, y, 0); // Center
				self._pushVertex(fillVertices, x, y, 2);
				self._pushVertex(fillVertices, x, y, 3);
				self._pushVertex(fillVertices, x, y, 0); // Center
				self._pushVertex(fillVertices, x, y, 3);
				self._pushVertex(fillVertices, x, y, 4);
				self._pushVertex(fillVertices, x, y, 0); // Center
				self._pushVertex(fillVertices, x, y, 4);
				self._pushVertex(fillVertices, x, y, 1);
			} else {
				for (i = 0, iLen = 48; i < iLen; i++) {
					self._pushVertex(fillVertices, x, y, -1); // Center
					self._pushVertex(fillVertices, x, y, i / iLen); // Point 1
					self._pushVertex(fillVertices, x, y, (i + 1) / iLen); // Point 2

					self._pushVertex(lineVertices, x, y, i / iLen); // Point 1
				}
				self._pushVertex(lineVertices, x, y, 0); // Point 1
			}

			self._gl_line_vcounts[m] = lineVertices.length / 3 - lineVcountTotal;
			lineVcountTotal = lineVertices.length / 3;
		}

		self._gl_fill_vs = new Float32Array(fillVertices);
		self._gl_fill_vcount = fillVertices.length / 3;

		self._gl_line_vs = new Float32Array(lineVertices);
	},

	_pushVertex: function(array, x, y, z) {
		array.push(x);
		array.push(y);
		array.push(z);
	},

	_draw: function() {
		var self = this;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;

		var shape = options.shape;
		var size = options.size;
		var offset = options.offset;
		var fillColor = options.fillColor;
		var fillOpacity = options.fillOpacity;
		var gradual = options.gradual;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		for (var m = range[0]; m <= range[1]; m++) {
			var graphicOffset = [m * mapWidth, 0];

			if (options.fill) {
				if (shape == 'rect') {
					G.GLDrawUtil.drawShapeFill(self, graphicOffset, 'rect', //
						size, offset, G.Util.colorRgb(fillColor), null, null, fillOpacity, gradual);
				} else if (shape == 'image') {
					var imgSrc = G.Browser.getImageSrc(options.image);
					var img = G.DomUtil.getImgElement(imgSrc, function() {
						map._requestRedraw();
					});

					if (img._loaded) {
						var imageRotate = options.imageRotate;
						if (!options.imageGravity) {
							imageRotate += map._rotate;
						}
						G.GLDrawUtil.drawShapeImage(self, graphicOffset, img, size, offset, imageRotate);
					}
				} else if (shape == 'text') {
					G.GLDrawUtil.drawShapeText(self, graphicOffset, options.text, //
						size, offset, fillColor, fillOpacity, options.textFont, options.textStyle, options.textAlign); // hex color
				} else {
					G.GLDrawUtil.drawShapeFill(self, graphicOffset, 'circle', //
						size, offset, G.Util.colorRgb(fillColor), null, null, fillOpacity, gradual);
				}
			}

			if (options.outline || self._mouseOver || self._editing) {
				var lineColor = self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor);
				var lineWidth = self._mouseOver ? options.outlineWidth + options.lineHighlightWiden : options.outlineWidth;
				var lineOpacity = options.outlineOpacity;
				var lineDashArray = options.outlineDashArray;

				if (shape == 'rect') {
					G.GLDrawUtil.drawShapeLine(self, graphicOffset, 'rect', //
						size, offset, G.Util.colorRgb(lineColor), lineOpacity, lineWidth, null, null, lineDashArray);
				} else if (shape == 'image') {} else if (shape == 'text') {} else {
					G.GLDrawUtil.drawShapeLine(self, graphicOffset, 'circle', //
						size, offset, G.Util.colorRgb(lineColor), lineOpacity, lineWidth, null, null, lineDashArray);
				}
			}
		}

	},

	_onStartEdit: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], self._onVertexDragStart, self);
		}

		self._refreshVertexes();
	},

	_onEndEdit: function() {
		var self = this;
		var map = self._layer._map;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.DOWN) {
			map.removeListener(virtualMouse.DOWN[i], self._onVertexDragStart, self);
		}

		self._removeVertexes();
	},

	_onMouseOver: function() {
		var self = this;
		var layer = self._layer;
		if (!layer) {
			return;
		}

		var map = layer._map;
		var domUtil = G.DomUtil;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		map._requestRedraw();

		if (!self._isVertex) {
			domUtil.addClass(map._layersFrame, 'g-clickable');
		} else {
			domUtil.addClass(map._layersFrame, 'g-edit');
		}
	},

	_onMouseOut: function() {
		var self = this;
		var layer = self._layer;
		if (!layer) {
			return;
		}

		var map = layer._map;
		var domUtil = G.DomUtil;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		map._requestRedraw();

		if (!self._isVertex) {
			domUtil.removeClass(map._layersFrame, 'g-clickable');
		} else {
			domUtil.removeClass(map._layersFrame, 'g-edit');
		}
	}



});
/* global G:false */
G.Graphic.MultiPolygon = G.Graphic.MultiPolygon.extend({

	_onAdded: function() {
		var self = this;
		var map = self._layer._map;

		self._ensureGl();

		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var self = this;
		var map = self._layer._map;
		var gl = map._gl;

		gl.deleteBuffer(self._gl_fill_vb);
		self._gl_fill_vb = null;

		var fakeLineGraphics = self._fakeLineGraphics || [];
		var i, iLen, fakeG;
		for (i = 0, iLen = fakeLineGraphics.length; i < iLen; i++) {
			fakeG = fakeLineGraphics[i];

			gl.deleteBuffer(fakeG._gl_line_vb);
			fakeG._gl_line_vb = null;
		}

		if (map) {
			map._requestRedraw();
		}
	},

	_onGeomUpdated: function() {
		this._ensureGl();
	},

	_ensureGl: function() {
		var self = this;

		var geom = self.geom;
		if (!geom || !geom['m']) {
			return;
		}

		var i, iLen, j, jLen;
		var part, pt, lastPt;

		// Triangulation
		var contour, hole;

		var polygons = geom['m'];
		var pg;

		var fillVertices = [];
		var fakeLineGraphics = self._fakeLineGraphics = []; // 用于渲染outline的伪Graphic.Polyline对象	

		for (var n = 0, nLen = polygons.length; n < nLen; n++) {
			pg = polygons[n];

			part = pg[0];
			contour = [];
			lastPt = null;
			for (j = 0, jLen = part.length; j < jLen; j++) {
				pt = part[j];
				if (lastPt && lastPt[0] == pt[0] && lastPt[1] == pt[1]) {
					continue;
				}

				if (j == jLen - 1 && pt[0] == part[0][0] && pt[1] == part[0][1]) {
					continue;
				}

				contour.push(new poly2tri.Point(pt[0], pt[1]));
				lastPt = pt;
			}
			var swctx = new poly2tri.SweepContext(contour);

			for (i = 1, iLen = pg.length; i < iLen; i++) {
				part = pg[i];
				hole = [];
				lastPt = null;
				for (j = 0, jLen = part.length; j < jLen; j++) {
					pt = part[j];
					if (lastPt && lastPt[0] == pt[0] && lastPt[1] == pt[1]) {
						continue;
					}

					if (j == jLen - 1 && pt[0] == part[0][0] && pt[1] == part[0][1]) {
						continue;
					}

					hole.push(new poly2tri.Point(pt[0], pt[1]));
					lastPt = pt;
				}
				swctx.addHole(hole);
			}
			try {
				swctx.triangulate();
			} catch (e) {}

			var triangles = swctx.getTriangles();

			var tri, triPt;
			for (i = 0, iLen = triangles.length; i < iLen; i++) {
				tri = triangles[i];

				for (j = 0; j < 3; j++) {
					triPt = tri.getPoint(j);
					fillVertices.push(triPt.x);
					fillVertices.push(triPt.y);
				}
			}

			var fakeG, lineVertices;
			for (i = 0, iLen = pg.length; i < iLen; i++) {
				part = pg[i];

				fakeG = {};

				lineVertices = [];
				for (j = 0, jLen = part.length; j < jLen; j++) {
					pt = part[j];
					lineVertices.push(pt[0]);
					lineVertices.push(pt[1]);
				}
				pt = part[0];
				lineVertices.push(pt[0]);
				lineVertices.push(pt[1]);

				fakeG._gl_line_vs = new Float32Array(lineVertices);
				fakeG._gl_line_vcounts = [lineVertices.length / 2];

				fakeLineGraphics.push(fakeG);
			}
		}

		self._gl_fill_vs = new Float32Array(fillVertices);
		self._gl_fill_vcount = fillVertices.length / 2;
	},

	_draw: function() {
		var self = this;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		for (var m = range[0]; m <= range[1]; m++) {
			var graphicOffset = [m * mapWidth, 0];

			if (options.fill) {
				if (options.fillImage) {
					var imgSrc = G.Browser.getImageSrc(options.fillImage);
					var img = G.DomUtil.getImgElement(imgSrc, function() {
						map._requestRedraw();
					}, null, '*');

					if (img._loaded) {
						var imageSize = options.fillImageSize;
						G.GLDrawUtil.drawFill(self, graphicOffset, null, img, imageSize, options.fillOpacity);
					}
				} else {
					G.GLDrawUtil.drawFill(self, graphicOffset, G.Util.colorRgb(options.fillColor), null, null, options.fillOpacity);
				}
			}

			if (options.outline || self._mouseOver || self._editing) {
				var lineColor = self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor);
				var lineCap = options.outlineCap;
				var lineJoin = options.outlineJoin;
				var lineWidth = (options.outline ? options.outlineWidth : 0) + (self._mouseOver ? options.lineHighlightWiden : 0);
				var lineOpacity = options.outlineOpacity;
				var lineDashArray = options.outlineDashArray;

				var fakeLineGraphics = self._fakeLineGraphics;
				var i, iLen, fakeG;
				for (i = 0, iLen = fakeLineGraphics.length; i < iLen; i++) {
					fakeG = fakeLineGraphics[i];
					fakeG._layer = layer; // GLDrawUtil中会使用
					G.GLDrawUtil.drawLine(fakeG, graphicOffset, G.Util.colorRgb(lineColor), lineOpacity, lineWidth, lineCap, lineJoin, lineDashArray);
				}
			}
		}

	},

	_drawMask: function() {
		var self = this;
		var map = self._map;

		var ctx = map._maskCtx;

		var polygons = self.geom['m'];
		var pg;

		var method;
		var part, pt;

		var canvasOffset = map._canvasOffset;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];


		ctx.beginPath();

		for (var m = range[0]; m <= range[1]; m++) {
			for (var n = 0, nLen = polygons.length; n < nLen; n++) {
				pg = polygons[n];

				for (var i = 0, iLen = pg.length; i < iLen; i++) {
					part = pg[i];

					for (var j = 0, jLen = part.length; j < jLen; j++) {
						pt = part[j];
						pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);

						method = j === 0 ? 'moveTo' : 'lineTo';
						ctx[method](pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
					}

					pt = part[0];
					pt = map.toScreen([pt[0] + m * mapWidth, pt[1]]);
					ctx.lineTo(pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
				}
			}
		}

		ctx.fill();
	},

	_onStartEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		for (i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], graphic._onVertexDragStart, graphic);
		}

		graphic._refreshVertexes();
	},

	_onEndEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		var i, downType;
		for (i in virtualMouse.DOWN) {
			downType = virtualMouse.DOWN[i];
			map.removeListener(downType, graphic._onVertexDragStart, graphic);
			map.removeListener(virtualMouse.MOVE[downType], graphic._onVertexDrag, graphic);
			map.removeListener(virtualMouse.UP[downType], graphic._onVertexDragEnd, graphic);
		}

		graphic._removeVertexes();

		G.DomUtil.removeClass(map._layersFrame, 'g-edit');

		map._requestRedraw();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		map._requestRedraw();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		map._requestRedraw();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}



});
/* global G:false */
G.Graphic.MultiPolyline = G.Graphic.MultiPolyline.extend({

	_onAdded: function() {
		var self = this;
		var map = self._layer._map;

		self._ensureGl();

		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var self = this;
		var map = self._layer._map;
		var gl = map._gl;

		gl.deleteBuffer(self._gl_line_vb);
		self._gl_line_vb = null;

		if (map) {
			map._requestRedraw();
		}
	},

	_onGeomUpdated: function() {
		this._ensureGl();
	},

	_ensureGl: function() {
		var self = this;

		var geom = self.geom;
		if (!geom || !geom['m']) {
			return;
		}

		var polylines = geom['m'];
		var pl;

		var pt;
		var vertices = [];

		self._gl_line_vcounts = self._gl_line_vcounts || [];

		for (var m = 0, mLen = polylines.length; m < mLen; m++) {
			pl = polylines[m];

			for (var i = 0, iLen = pl.length; i < iLen; i++) {
				pt = pl[i];

				vertices.push(pt[0]);
				vertices.push(pt[1]);
			}

			self._gl_line_vcounts[m] = pl.length;
		}

		self._gl_line_vs = new Float32Array(vertices);
	},

	_draw: function() {
		var self = this;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;

		var colorHex = self._editing ? options.lineHighlightColor : options.lineColor;
		var color = G.Util.colorRgb(colorHex);
		var alpha = options.lineOpacity;
		var lineWidth = self._mouseOver ? options.lineWidth + options.lineHighlightWiden : options.lineWidth;
		var lineCap = options.lineCap;
		var lineJoin = options.lineJoin;
		var dashArray = options.lineDashArray;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		for (var m = range[0]; m <= range[1]; m++) {
			var graphicOffset = [m * mapWidth, 0];

			G.GLDrawUtil.drawLine(self, graphicOffset, color, alpha, lineWidth, lineCap, lineJoin, dashArray);
		}
	},

	_onStartEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		for (i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], graphic._onVertexDragStart, graphic);
		}

		graphic._refreshVertexes();
	},

	_onEndEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		var i, downType;
		for (i in virtualMouse.DOWN) {
			downType = virtualMouse.DOWN[i];
			map.removeListener(downType, graphic._onVertexDragStart, graphic);
			map.removeListener(virtualMouse.MOVE[downType], graphic._onVertexDrag, graphic);
			map.removeListener(virtualMouse.UP[downType], graphic._onVertexDragEnd, graphic);
		}

		graphic._removeVertexes();

		G.DomUtil.removeClass(map._layersFrame, 'g-edit');

		map._requestRedraw();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		map._requestRedraw();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		map._requestRedraw();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}


});
/* global G:false */
G.Graphic.Point = G.Graphic.Point.extend({

	_onAdded: function() {
		var self = this;
		var map = self._layer._map;

		self._ensureGl();

		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var self = this;
		var map = self._layer._map;
		var gl = map._gl;

		gl.deleteBuffer(self._gl_fill_vb);
		self._gl_fill_vb = null;

		gl.deleteBuffer(self._gl_line_vb);
		self._gl_line_vb = null;

		if (map) {
			map._requestRedraw();
		}
	},

	_onGeomUpdated: function() {
		this._ensureGl();
	},

	_ensureGl: function() {
		var self = this;
		var options = self.options;

		var shape = options.shape;

		var geom = self.geom;
		if (!geom) {
			return;
		}

		var x = geom[0];
		var y = geom[1];

		var fillVertices = [];
		var lineVertices = [];

		var i, iLen;

		if (shape == 'rect') {
			self._pushVertex(fillVertices, x, y, 0); // Center
			self._pushVertex(fillVertices, x, y, 1);
			self._pushVertex(fillVertices, x, y, 2);
			self._pushVertex(fillVertices, x, y, 0); // Center
			self._pushVertex(fillVertices, x, y, 2);
			self._pushVertex(fillVertices, x, y, 3);
			self._pushVertex(fillVertices, x, y, 0); // Center
			self._pushVertex(fillVertices, x, y, 3);
			self._pushVertex(fillVertices, x, y, 4);
			self._pushVertex(fillVertices, x, y, 0); // Center
			self._pushVertex(fillVertices, x, y, 4);
			self._pushVertex(fillVertices, x, y, 1);

			self._pushVertex(lineVertices, x, y, 1);
			self._pushVertex(lineVertices, x, y, 2);
			self._pushVertex(lineVertices, x, y, 3);
			self._pushVertex(lineVertices, x, y, 4);
			self._pushVertex(lineVertices, x, y, 1);
		} else if (shape == 'image') {
			self._pushVertex(fillVertices, x, y, 0); // Center
			self._pushVertex(fillVertices, x, y, 1);
			self._pushVertex(fillVertices, x, y, 2);
			self._pushVertex(fillVertices, x, y, 0); // Center
			self._pushVertex(fillVertices, x, y, 2);
			self._pushVertex(fillVertices, x, y, 3);
			self._pushVertex(fillVertices, x, y, 0); // Center
			self._pushVertex(fillVertices, x, y, 3);
			self._pushVertex(fillVertices, x, y, 4);
			self._pushVertex(fillVertices, x, y, 0); // Center
			self._pushVertex(fillVertices, x, y, 4);
			self._pushVertex(fillVertices, x, y, 1);
		} else if (shape == 'text') {
			self._pushVertex(fillVertices, x, y, 0); // Center
			self._pushVertex(fillVertices, x, y, 1);
			self._pushVertex(fillVertices, x, y, 2);
			self._pushVertex(fillVertices, x, y, 0); // Center
			self._pushVertex(fillVertices, x, y, 2);
			self._pushVertex(fillVertices, x, y, 3);
			self._pushVertex(fillVertices, x, y, 0); // Center
			self._pushVertex(fillVertices, x, y, 3);
			self._pushVertex(fillVertices, x, y, 4);
			self._pushVertex(fillVertices, x, y, 0); // Center
			self._pushVertex(fillVertices, x, y, 4);
			self._pushVertex(fillVertices, x, y, 1);
		} else {
			for (i = 0, iLen = 48; i < iLen; i++) {
				self._pushVertex(fillVertices, x, y, -1); // Center
				self._pushVertex(fillVertices, x, y, i / iLen); // Point 1
				self._pushVertex(fillVertices, x, y, (i + 1) / iLen); // Point 2

				self._pushVertex(lineVertices, x, y, i / iLen); // Point 1
			}
			self._pushVertex(lineVertices, x, y, 0); // Point 1
		}


		self._gl_fill_vs = new Float32Array(fillVertices);
		self._gl_fill_vcount = fillVertices.length / 3;

		self._gl_line_vs = new Float32Array(lineVertices);
		self._gl_line_vcounts = [lineVertices.length / 3];
	},

	_pushVertex: function(array, x, y, z) {
		array.push(x);
		array.push(y);
		array.push(z);
	},

	_draw: function() {
		var self = this;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;

		var shape = options.shape;
		var size = options.size;
		var offset = options.offset;
		var fillColor = options.fillColor;
		var fillOpacity = options.fillOpacity;
		var gradual = options.gradual;

		var range = map._calcWrapPointRange(self.geom) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		for (var i = range[0]; i <= range[1]; i++) {
			var graphicOffset = [i * mapWidth, 0];

			if (options.fill) {
				if (shape == 'rect') {
					G.GLDrawUtil.drawShapeFill(self, graphicOffset, 'rect', //
						size, offset, G.Util.colorRgb(fillColor), null, null, fillOpacity, gradual);
				} else if (shape == 'image') {
					var imgSrc = G.Browser.getImageSrc(options.image);
					var img = G.DomUtil.getImgElement(imgSrc, function() {
						map._requestRedraw();
					});

					if (img._loaded) {
						var imageRotate = options.imageRotate;
						if (!options.imageGravity) {
							imageRotate += map._rotate;
						}
						G.GLDrawUtil.drawShapeImage(self, graphicOffset, img, size, offset, imageRotate);
					}
				} else if (shape == 'text') {
					G.GLDrawUtil.drawShapeText(self, graphicOffset, options.text, //
						size, offset, fillColor, fillOpacity, options.textFont, options.textStyle, options.textAlign); // hex color
				} else {
					G.GLDrawUtil.drawShapeFill(self, graphicOffset, 'circle', //
						size, offset, G.Util.colorRgb(fillColor), null, null, fillOpacity, gradual);
				}
			}

			if (options.outline || self._mouseOver || self._editing) {
				var lineColor = self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor);
				var lineWidth = self._mouseOver ? options.outlineWidth + options.lineHighlightWiden : options.outlineWidth;
				var lineOpacity = options.outlineOpacity;
				var lineDashArray = options.outlineDashArray;

				if (shape == 'rect') {
					G.GLDrawUtil.drawShapeLine(self, graphicOffset, 'rect', //
						size, offset, G.Util.colorRgb(lineColor), lineOpacity, lineWidth, null, null, lineDashArray);
				} else if (shape == 'image') {} else if (shape == 'text') {} else {
					G.GLDrawUtil.drawShapeLine(self, graphicOffset, 'circle', //
						size, offset, G.Util.colorRgb(lineColor), lineOpacity, lineWidth, null, null, lineDashArray);
				}
			}
		}

	},

	_onStartEdit: function() {
		var self = this;
		var layer = self._layer;
		var map = layer._map;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], self._onVertexDragStart, self);
		}

		self._refreshVertexes();
	},

	_onEndEdit: function() {
		var self = this;
		var map = self._layer._map;
		var virtualMouse = self.virtualMouse;

		for (var i in virtualMouse.DOWN) {
			map.removeListener(virtualMouse.DOWN[i], self._onVertexDragStart, self);
		}

		self._removeVertexes();
	},

	_onMouseOver: function() {
		var self = this;
		var layer = self._layer;
		if (!layer) {
			return;
		}

		var map = layer._map;
		var domUtil = G.DomUtil;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		map._requestRedraw();

		if (!self._isVertex) {
			domUtil.addClass(map._layersFrame, 'g-clickable');
		} else {
			domUtil.addClass(map._layersFrame, 'g-edit');
		}
	},

	_onMouseOut: function() {
		var self = this;
		var layer = self._layer;
		if (!layer) {
			return;
		}

		var map = layer._map;
		var domUtil = G.DomUtil;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		map._requestRedraw();

		if (!self._isVertex) {
			domUtil.removeClass(map._layersFrame, 'g-clickable');
		} else {
			domUtil.removeClass(map._layersFrame, 'g-edit');
		}
	}



});
/* global G:false */
G.Graphic.Polygon = G.Graphic.Polygon.extend({

	_onAdded: function() {
		var self = this;
		var map = self._layer._map;

		self._ensureGl();

		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var self = this;
		var map = self._layer._map;
		var gl = map._gl;

		gl.deleteBuffer(self._gl_fill_vb);
		self._gl_fill_vb = null;

		var fakeLineGraphics = self._fakeLineGraphics || [];
		var i, iLen, fakeG;
		for (i = 0, iLen = fakeLineGraphics.length; i < iLen; i++) {
			fakeG = fakeLineGraphics[i];

			gl.deleteBuffer(fakeG._gl_line_vb);
			fakeG._gl_line_vb = null;
		}

		if (map) {
			map._requestRedraw();
		}
	},

	_onGeomUpdated: function() {
		this._ensureGl();
	},

	_ensureGl: function() {
		var self = this;

		var geom = self.geom;
		if (!geom) {
			return;
		}

		var i, iLen, j, jLen;
		var part, pt, lastPt;


		// Triangulation
		var contour, hole;

		part = geom[0];
		contour = [];
		lastPt = null;
		for (j = 0, jLen = part.length; j < jLen; j++) {
			pt = part[j];
			if (lastPt && lastPt[0] == pt[0] && lastPt[1] == pt[1]) {
				continue;
			}

			if (j == jLen - 1 && pt[0] == part[0][0] && pt[1] == part[0][1]) {
				continue;
			}

			contour.push(new poly2tri.Point(pt[0], pt[1]));
			lastPt = pt;
		}
		var swctx = new poly2tri.SweepContext(contour);

		for (i = 1, iLen = geom.length; i < iLen; i++) {
			part = geom[i];
			hole = [];
			lastPt = null;
			for (j = 0, jLen = part.length; j < jLen; j++) {
				pt = part[j];
				if (lastPt && lastPt[0] == pt[0] && lastPt[1] == pt[1]) {
					continue;
				}

				if (j == jLen - 1 && pt[0] == part[0][0] && pt[1] == part[0][1]) {
					continue;
				}

				hole.push(new poly2tri.Point(pt[0], pt[1]));
				lastPt = pt;
			}
			swctx.addHole(hole);
		}
		try {
			swctx.triangulate();
		} catch (e) {}

		var triangles = swctx.getTriangles();

		var fillVertices = [];
		var tri, triPt;
		for (i = 0, iLen = triangles.length; i < iLen; i++) {
			tri = triangles[i];

			for (j = 0; j < 3; j++) {
				triPt = tri.getPoint(j);
				fillVertices.push(triPt.x);
				fillVertices.push(triPt.y);
			}
		}

		self._gl_fill_vs = new Float32Array(fillVertices);
		self._gl_fill_vcount = fillVertices.length / 2;

		var fakeLineGraphics = self._fakeLineGraphics = []; // 用于渲染outline的伪Graphic.Polyline对象
		var fakeG, lineVertices;
		for (i = 0, iLen = geom.length; i < iLen; i++) {
			part = geom[i];

			fakeG = {};

			lineVertices = [];
			for (j = 0, jLen = part.length; j < jLen; j++) {
				pt = part[j];
				lineVertices.push(pt[0]);
				lineVertices.push(pt[1]);
			}
			pt = part[0];
			lineVertices.push(pt[0]);
			lineVertices.push(pt[1]);

			fakeG._gl_line_vs = new Float32Array(lineVertices);
			fakeG._gl_line_vcounts = [lineVertices.length / 2];

			fakeLineGraphics.push(fakeG);
		}

	},

	_draw: function() {
		var self = this;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		for (var m = range[0]; m <= range[1]; m++) {
			var graphicOffset = [m * mapWidth, 0];

			if (options.fill) {
				if (options.fillImage) {
					var imgSrc = G.Browser.getImageSrc(options.fillImage);
					var img = G.DomUtil.getImgElement(imgSrc, function() {
						map._requestRedraw();
					}, null, '*');

					if (img._loaded) {
						var imageSize = options.fillImageSize;
						G.GLDrawUtil.drawFill(self, graphicOffset, null, img, imageSize, options.fillOpacity);
					}
				} else {
					G.GLDrawUtil.drawFill(self, graphicOffset, G.Util.colorRgb(options.fillColor), null, null, options.fillOpacity);
				}
			}

			if (options.outline || self._mouseOver || self._editing) {
				var lineColor = self._editing ? options.lineHighlightColor : (options.outline ? options.outlineColor : options.fillColor);
				var lineCap = options.outlineCap;
				var lineJoin = options.outlineJoin;
				var lineWidth = (options.outline ? options.outlineWidth : 0) + (self._mouseOver ? options.lineHighlightWiden : 0);
				var lineOpacity = options.outlineOpacity;
				var lineDashArray = options.outlineDashArray;

				var fakeLineGraphics = self._fakeLineGraphics;
				var i, iLen, fakeG;
				for (i = 0, iLen = fakeLineGraphics.length; i < iLen; i++) {
					fakeG = fakeLineGraphics[i];
					fakeG._layer = layer; // GLDrawUtil中会使用
					G.GLDrawUtil.drawLine(fakeG, graphicOffset, G.Util.colorRgb(lineColor), lineOpacity, lineWidth, lineCap, lineJoin, lineDashArray);
				}
			}
		}

	},

	_drawMask: function() {
		var self = this;
		var map = self._map;

		var ctx = map._maskCtx;

		var geom = self.geom;
		var method;
		var part, pt;

		var canvasOffset = map._canvasOffset;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		for (var m = range[0]; m <= range[1]; m++) {
			var graphicOffset = [m * mapWidth, 0];

			ctx.beginPath();

			for (var i = 0, iLen = geom.length; i < iLen; i++) {
				part = geom[i];

				for (var j = 0, jLen = part.length; j < jLen; j++) {
					pt = part[j];
					pt = map.toScreen([pt[0] + graphicOffset[0], pt[1]]);

					method = j === 0 ? 'moveTo' : 'lineTo';
					ctx[method](pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
				}

				pt = part[0];
				pt = map.toScreen([pt[0] + graphicOffset[0], pt[1]]);
				ctx.lineTo(pt[0] + canvasOffset[0], pt[1] + canvasOffset[1]);
			}

			ctx.fill();
		}
	},

	_onStartEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		for (i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], graphic._onVertexDragStart, graphic);
		}

		graphic._refreshVertexes();
	},

	_onEndEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		var i, downType;
		for (i in virtualMouse.DOWN) {
			downType = virtualMouse.DOWN[i];
			map.removeListener(downType, graphic._onVertexDragStart, graphic);
			map.removeListener(virtualMouse.MOVE[downType], graphic._onVertexDrag, graphic);
			map.removeListener(virtualMouse.UP[downType], graphic._onVertexDragEnd, graphic);
		}

		graphic._removeVertexes();

		G.DomUtil.removeClass(map._layersFrame, 'g-edit');

		map._requestRedraw();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		map._requestRedraw();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		map._requestRedraw();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}



});
/* global G:false */
G.Graphic.Polyline = G.Graphic.Polyline.extend({

	_onAdded: function() {
		var self = this;
		var map = self._layer._map;

		self._ensureGl();

		if (map) {
			map._requestRedraw();
		}
	},

	_onRemoved: function() {
		var self = this;
		var map = self._layer._map;
		var gl = map._gl;

		gl.deleteBuffer(self._gl_line_vb);
		self._gl_line_vb = null;

		if (map) {
			map._requestRedraw();
		}
	},

	_onGeomUpdated: function() {
		this._ensureGl();
	},

	_ensureGl: function() {
		var self = this;

		var pts = self.geom;
		if (!pts || pts.length < 2) {
			return;
		}

		var vertices = [];
		var i, iLen, pt;
		for (i = 0, iLen = pts.length; i < iLen; i++) {
			pt = pts[i];
			vertices.push(pt[0]);
			vertices.push(pt[1]);
		}
		self._gl_line_vs = new Float32Array(vertices);
		self._gl_line_vcounts = [pts.length];
	},

	_draw: function() {
		var self = this;
		var options = self.options;
		var layer = self._layer;
		var map = layer._map;

		var colorHex = self._editing ? options.lineHighlightColor : options.lineColor;
		var color = G.Util.colorRgb(colorHex);
		var alpha = options.lineOpacity;
		var lineWidth = self._mouseOver ? options.lineWidth + options.lineHighlightWiden : options.lineWidth;
		var lineCap = options.lineCap;
		var lineJoin = options.lineJoin;
		var dashArray = options.lineDashArray;

		var bbox = self.bbox;
		var cx = (bbox[0] + bbox[2]) / 2;
		var cy = (bbox[1] + bbox[3]) / 2;

		var range = map._calcWrapPointRange([cx, cy]) || [0, 0];
		var maxExtent = map.options.maxExtent;
		var mapWidth = maxExtent[2] - maxExtent[0];

		for (var m = range[0]; m <= range[1]; m++) {
			var graphicOffset = [m * mapWidth, 0];

			G.GLDrawUtil.drawLine(self, graphicOffset, color, alpha, lineWidth, lineCap, lineJoin, dashArray);
		}
	},

	_onStartEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		for (i in virtualMouse.DOWN) {
			map.addListener(virtualMouse.DOWN[i], graphic._onVertexDragStart, graphic);
		}

		graphic._refreshVertexes();
	},

	_onEndEdit: function() {
		var graphic = this;
		var map = graphic._layer._map;
		var virtualMouse = graphic.virtualMouse;

		var i, downType;
		for (i in virtualMouse.DOWN) {
			downType = virtualMouse.DOWN[i];
			map.removeListener(downType, graphic._onVertexDragStart, graphic);
			map.removeListener(virtualMouse.MOVE[downType], graphic._onVertexDrag, graphic);
			map.removeListener(virtualMouse.UP[downType], graphic._onVertexDragEnd, graphic);
		}

		graphic._removeVertexes();

		G.DomUtil.removeClass(map._layersFrame, 'g-edit');

		map._requestRedraw();
	},

	_onMouseOver: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging && !self.options.allowPan) {
			//dragHandler.off();
		}

		map._requestRedraw();

		G.DomUtil.addClass(map._layersFrame, 'g-clickable');
	},

	_onMouseOut: function() {
		var self = this;
		var map = self._layer._map;

		var dragHandler = map._handlers.Drag;
		if (dragHandler && !dragHandler._dragging) {
			//dragHandler.on();
		}

		map._requestRedraw();

		G.DomUtil.removeClass(map._layersFrame, 'g-clickable');
	}


});
/* global G:false */
G.Map = G.Map.extend({

	print: function(imageWidth, imageHeight) {
		var self = this;
		var domUtil = G.DomUtil;
		var ratio = G.Browser.getCanvasRatio();

		var size = self.getSize();
		var w = size[0];
		var h = size[1];
		var iw = imageWidth || w;
		var ih = imageHeight || h;

		var scaleWidth = iw / w;
		var scaleHeight = ih / h;
		var scale = Math.max(scaleWidth, scaleHeight);

		var canvas = self._gl.canvas;
		var cw = canvas.width / ratio[0];
		var ch = canvas.height / ratio[1];

		var imageCanvas = domUtil.create('canvas');
		imageCanvas.width = iw;
		imageCanvas.height = ih;

		imageCanvas.getContext('2d').drawImage(canvas, (iw - cw * scale) / 2, (ih - ch * scale) / 2, cw * scale, ch * scale);

		return imageCanvas.toDataURL();
	},

	_initAddition: function() {
		var self = this,
			domUtil = G.DomUtil;

		// WebGL canvas
		var contextNames = ['webgl', 'experimental-webgl'];
		var i, len;
		for (i = 0, len = contextNames.length; i < len && !self._gl; i++) {
			gl = self._gl = domUtil.create('canvas').getContext(contextNames[i], {
				alpha: false,
				preserveDrawingBuffer: true
			});
		}

		// Canvas to draw texture
		self._textureCtx = domUtil.create('canvas').getContext('2d');

		self._initGL();

		self._onScreenCtx = domUtil.create('canvas', 'g-layer', self._layersFrame).getContext('2d');
		self._snapshotCtx = domUtil.create('canvas').getContext('2d');
		self._maskCtx = domUtil.create('canvas').getContext('2d');

		self._mode = 'webgl';
	},

	_initGL: function() {
		var self = this;
		var gl = self._gl;

		if (!gl) {
			return;
		}

		var shaderUtil = G.GLShaderUtil;

		var tileVS = shaderUtil.compile(gl, gl.VERTEX_SHADER, shaderUtil.TILE_VS);
		var tileFS = shaderUtil.compile(gl, gl.FRAGMENT_SHADER, shaderUtil.TILE_FS);
		gl.tileProgram = shaderUtil.genProgram(gl, tileVS, tileFS);

		var ptVS = shaderUtil.compile(gl, gl.VERTEX_SHADER, shaderUtil.PT_VS);
		var ptFS = shaderUtil.compile(gl, gl.FRAGMENT_SHADER, shaderUtil.PT_FS);
		gl.ptProgram = shaderUtil.genProgram(gl, ptVS, ptFS);

		var lineVS = shaderUtil.compile(gl, gl.VERTEX_SHADER, shaderUtil.LINE_VS);
		var lineFS = shaderUtil.compile(gl, gl.FRAGMENT_SHADER, shaderUtil.LINE_FS);
		gl.lineProgram = shaderUtil.genProgram(gl, lineVS, lineFS);

		var fillVS = shaderUtil.compile(gl, gl.VERTEX_SHADER, shaderUtil.FILL_VS);
		var fillFS = shaderUtil.compile(gl, gl.FRAGMENT_SHADER, shaderUtil.FILL_FS);
		gl.fillProgram = shaderUtil.genProgram(gl, fillVS, fillFS);

		var shapeFillVS = shaderUtil.compile(gl, gl.VERTEX_SHADER, shaderUtil.SHAPE_FILL_VS);
		var shapeFillFS = shaderUtil.compile(gl, gl.FRAGMENT_SHADER, shaderUtil.SHAPE_FILL_FS);
		gl.shapeFillProgram = shaderUtil.genProgram(gl, shapeFillVS, shapeFillFS);

		var shapeLineVS = shaderUtil.compile(gl, gl.VERTEX_SHADER, shaderUtil.SHAPE_LINE_VS);
		var shapeLineFS = shaderUtil.compile(gl, gl.FRAGMENT_SHADER, shaderUtil.SHAPE_LINE_FS);
		gl.shapeLineProgram = shaderUtil.genProgram(gl, shapeLineVS, shapeLineFS);

		var shapeImageVS = shaderUtil.compile(gl, gl.VERTEX_SHADER, shaderUtil.SHAPE_IMAGE_VS);
		var shapeImageFS = shaderUtil.compile(gl, gl.FRAGMENT_SHADER, shaderUtil.SHAPE_IMAGE_FS);
		gl.shapeImageProgram = shaderUtil.genProgram(gl, shapeImageVS, shapeImageFS);


		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.disable(gl.DEPTH_TEST);

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		//gl.enable(gl.CULL_FACE);
		//gl.frontFace(gl.CW);
		//gl.cullFace(gl.BACK);

		gl.flush();
	},

	_redrawSnapshot: function(startCenter, startRotate, startRes) {
		var map = this;

		var ratio = G.Browser.getCanvasRatio();
		var onScreenCanvas = map._onScreenCtx.canvas;
		var w = onScreenCanvas.width / (ratio[0] || 1);
		var h = onScreenCanvas.height / (ratio[1] || 1);

		var pr = G.Browser.getPxRatio();
		var prX = pr[0];
		var prY = pr[1];

		var newCenter = map._center;
		var newRotate = map._rotate;
		var newRes = map._res;

		var rotate = newRotate - startRotate;
		var scale = newRes / startRes;

		var ctx = map._onScreenCtx;

		var dx, dy, v, mx, my, x, y;

		// 求canvas左上角点的地图坐标
		dx = -w / 2;
		dy = -h / 2;
		if (startRotate) {
			v = G.MathUtil.rotateVector([dx, dy], -startRotate);

			dx = v[0];
			dy = v[1];
		}
		mx = dx * startRes * prX + startCenter[0];
		my = -dy * startRes * prY + startCenter[1];

		// 求canvas左上角新的屏幕坐标
		dx = (mx - newCenter[0]) / newRes / prX;
		dy = -(my - newCenter[1]) / newRes / prY;
		if (newRotate) {
			v = G.MathUtil.rotateVector([dx, dy], newRotate);

			dx = v[0];
			dy = v[1];
		}
		x = w / 2 + dx;
		y = h / 2 + dy;

		map._clearCanvas(ctx);

		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(rotate / G.MathUtil.DEGREE_PER_RADIAN);
		ctx.drawImage(map._snapshotCtx.canvas, 0, 0, w / scale, h / scale);

		ctx.restore();
	},

	_redraw: function() {
		var map = this;
		var gl = map._gl;

		if (!gl) {
			return;
		}

		var zoomAnim = map._zoomAnim;
		var rotateAnim = map._rotateAnim;
		var pinchHandler = map._handlers.Pinch;

		if (!map.options.canvasAnimRedraw && zoomAnim && zoomAnim._playing) {
			map._redrawSnapshot(zoomAnim._startCenter, map._rotate, zoomAnim._startRes);
			return;
		}

		if (!map.options.canvasAnimRedraw && rotateAnim && rotateAnim._playing) {
			map._redrawSnapshot(map._center, rotateAnim._startRotate, map._res);
			return;
		}

		if (!map.options.canvasAnimRedraw && pinchHandler && pinchHandler._pinching) {
			map._redrawSnapshot(pinchHandler._startCenter, pinchHandler._startRotate, pinchHandler._startRes);
			return;
		}

		map._clearGlCanvas();

		var i, id, layer;
		for (i in map._layerOrder) {
			id = map._layerOrder[i];
			layer = map._layers[id];

			if (layer.isVisible()) {
				layer._draw();
			}
		}

		gl.flush();

		var ratio = G.Browser.getCanvasRatio();
		var onScreenCanvas = map._onScreenCtx.canvas;
		w = onScreenCanvas.width / (ratio[0] || 1);
		h = onScreenCanvas.height / (ratio[1] || 1);

		try {
			map._clearCanvas(map._onScreenCtx);
			map._onScreenCtx.drawImage(map._gl.canvas, 0, 0, w, h);
		} catch (e) {
			//console.log(e);
		}

		try {
			map._onScreenCtx.drawImage(map._maskCtx.canvas, 0, 0);
		} catch (e) {
			//console.log(e);
		}

		map._drawMask();

		map.fireEvent('redraw');
	},

	_update: function() {
		var map = this;
		var gl = map._gl;

		if (!gl) {
			return;
		}

		map._clearGlCanvas();

		var layer;
		for (var i in map._layers) {
			layer = map._layers[i];

			if (layer.isVisible()) {
				layer._update();
			}
		}

		gl.flush();

		var ratio = G.Browser.getCanvasRatio();
		var onScreenCanvas = map._onScreenCtx.canvas;
		w = onScreenCanvas.width / (ratio[0] || 1);
		h = onScreenCanvas.height / (ratio[1] || 1);

		try {
			map._clearCanvas(map._onScreenCtx);
			map._onScreenCtx.drawImage(map._gl.canvas, 0, 0, w, h);
		} catch (e) {
			//console.log(e);
		}

		map._drawMask();

		try {
			map._onScreenCtx.drawImage(map._maskCtx.canvas, 0, 0);
		} catch (e) {
			//console.log(e);
		}

		map.fireEvent('update');
	},

	_drawMask: function() {
		var map = this;
		var ctx = map._maskCtx;

		var mapOptions = map.options;

		var j, mask;
		var masks = map._masks;
		if (!masks) {
			return;
		}

		var maskCount = masks.length;
		if (mapOptions.mask) {
			map._clearCanvas(map._maskCtx);

			if (maskCount == 0) {
				return;
			}

			ctx.save();

			ctx.globalCompositeOperation = "source-over";
			ctx.fillStyle = mapOptions.maskColor;
			ctx.globalAlpha = mapOptions.maskOpacity;
			ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.globalCompositeOperation = "destination-out";
			ctx.globalAlpha = 1;

			for (j = 0; j < maskCount; j++) {
				mask = masks[j];
				if (mask._drawMask) {
					mask._drawMask();
				}
			}

			ctx.restore();
		}
	},

	_onResize: function() {
		var map = this;

		map._resizeCanvases();

		map._updateDrawSize();

		map._requestUpdate();
	},

	_clearCanvas: function(ctx) {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	},

	_clearGlCanvas: function() {
		var map = this;
		var gl = map._gl;

		var rgb = G.Util.colorRgb(map.options.glColor);

		gl.clearColor(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	},

	_resizeCanvas: function(ctx, w, h, ratio) {
		var self = this;
		var canvas = ctx.canvas;

		var ratioX = ratio ? (ratio[0] || 1) : 1;
		var ratioY = ratio ? (ratio[1] || 1) : 1;

		var expandFactor = self.options.canvasExpandFactor;
		var ew = w * expandFactor;
		var eh = h * expandFactor;
		var vw = w + 2 * ew;
		var vh = h + 2 * eh;

		G.DomUtil.setPosition(canvas, -ew, -eh);

		if (ratioX == 1 && ratioY == 1) {
			canvas.width = vw;
			canvas.height = vh;
			canvas.style.width = '';
			canvas.style.height = '';
			ctx.scale(1, 1);
		} else {
			canvas.width = vw * ratioX;
			canvas.height = vh * ratioY;
			canvas.style.width = vw + 'px';
			canvas.style.height = vh + 'px';
			ctx.scale(ratioX, ratioY);
		}
	},

	_resizeGlCanvas: function() {
		var map = this;
		var gl = map._gl;

		var canvas = gl.canvas;

		var ratio = G.Browser.getCanvasRatio();
		var ratioX = ratio ? (ratio[0] || 1) : 1;
		var ratioY = ratio ? (ratio[1] || 1) : 1;

		var size = map.getSize();
		var w = size[0],
			h = size[1];
		var hw = w / 2,
			hh = h / 2;

		var expandFactor = map.options.canvasExpandFactor;
		var ew = w * expandFactor;
		var eh = h * expandFactor;
		var vw = w + 2 * ew;
		var vh = h + 2 * eh;

		G.DomUtil.setPosition(canvas, -ew, -eh);
		map._canvasOffset = [ew, eh]; // Cache canvas‘s offset

		var oldCamera = map._camera;
		var near = oldCamera ? oldCamera.near : undefined;
		var far = oldCamera ? oldCamera.far : undefined;
		var camera = map._camera = new G.GLOrthoCamera(-hw - ew, hw + ew, -hh - eh, hh + eh, near, far);
		camera.moveTo(hw + ew, -hh - eh, camera.far / 2);
		camera.lookAt(hw + ew, -hh - eh, 0);

		if (ratioX == 1 && ratioY == 1) {
			canvas.width = vw;
			canvas.height = vh;
			canvas.style.width = '';
			canvas.style.height = '';
			map._canvasScale = [1, 1]; // WebGL canvas scale
		} else {
			// canvas.width = vw;
			// canvas.height = vh;
			// canvas.style.width = '';
			// canvas.style.height = '';
			canvas.width = vw * ratioX;
			canvas.height = vh * ratioY;
			canvas.style.width = vw + 'px';
			canvas.style.height = vh + 'px';
			map._canvasScale = [ratioX, ratioY]; // WebGL canvas scale
		}

		w = canvas.width;
		h = canvas.height;

		gl.viewport(0, 0, w, h);
	},

	_resizeCanvases: function() {
		var map = this;

		var size = map.getSize();
		var w = size[0],
			h = size[1];
		var ratio = G.Browser.getCanvasRatio();

		var ratioX = ratio ? (ratio[0] || 1) : 1;
		var ratioY = ratio ? (ratio[1] || 1) : 1;

		var expandFactor = map.options.canvasExpandFactor;
		var ew = w * expandFactor;
		var eh = h * expandFactor;
		var vw = w + 2 * ew;
		var vh = h + 2 * eh;

		map._canvasOffset = [ew, eh]; // Cache canvas‘s offset

		map._resizeCanvas(map._onScreenCtx, w, h, ratio);
		map._resizeCanvas(map._snapshotCtx, w, h, ratio);
		map._resizeCanvas(map._maskCtx, w, h, [1, 1]);

		map._resizeGlCanvas();
	},

	_onZoomStart: function(e) {
		this._snapshotCanvas();
	},

	_onRotateStart: function(e) {
		this._snapshotCanvas();
	},

	_onPinchStart: function(e) {
		this._snapshotCanvas();
	},

	_snapshotCanvas: function() {
		var map = this;

		if (!map.options.canvasAnimRedraw) {
			var onScreenCanvas = map._onScreenCtx.canvas;
			var ratio = G.Browser.getCanvasRatio();
			var w = onScreenCanvas.width / (ratio[0] || 1);
			var h = onScreenCanvas.height / (ratio[1] || 1);

			map._clearCanvas(map._snapshotCtx);
			map._snapshotCtx.drawImage(onScreenCanvas, 0, 0, w, h);
		}
	},

	_calcCanvasOffset: function() {
		var map = this;

		var size = map.getSize();
		var drawSize = map.getDrawSize();
		var w = drawSize[0],
			h = drawSize[1];

		var dx = (size[0] - w) / 2;
		var dy = (size[1] - h) / 2;

		return [dx, dy];
	},

	_beforeMergeFramePos: function() {
		var map = this,
			mapFrame = map._mapFrame,
			mapFramePos = G.DomUtil.getPosition(mapFrame);

		var x = mapFramePos[0];
		var y = mapFramePos[1];

		try {
			map._onScreenCtx.drawImage(map._onScreenCtx.canvas, x, y);
		} catch (e) {}

	}


});