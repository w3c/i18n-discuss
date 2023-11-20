grammar

# Client-side input validation and client-server communication methods for Chinese characters

## Author:

Xidong Ji (China Merchants Bank)

## Participate

[i18n-discuss](https://github.com/w3c/i18n-discuss/issues)

## Table of Contents

## Introduction

The complete Unicode (ISO/IEC 10646) Chinese character set includes:

* The basic set (U+4E00-U+9FA5), i.e., ISO/IEC 10646:1993
* CJK Unified Ideographs Extension A, i.e., U+3400-U+4DB5 in ISO/IEC 10646:1999
* U+3400-U+9FFF (commonly known as Basic Multilingual Plane Chinese characters)
* U+20000-U+2FFFF, i.e., CJK Unified Ideographs Extension B to Extension F (Extension I in September 2023), commonly known as the Supplementary Ideographic Plane (SIP)
* U+30000-U+3FFFF, i.e., CJK Unified Ideographs Extension G to Extension H, commonly known as the Tertiary Ideographic Plane (TIP)
* the non-starnd Private Use Area (PUA)
* CJK Compatibility Ideographs in the Basic Multilingual Plane (U+F900-U+FAFF). Only 12 of these code points are standard general-purpose Chinese characters.
* Unicode usually has unassigned code points at the end of each block to deal with urgent Chinese characters until a block is filled and the unassigned code bits of the next block will be used.

The current client-side input validation for Chinese is fragmented:

* Some use `[\u4e00-\u9fa5]` (20902 characters in total) to restrict the input (equivalent to GBK).
* Some use `[\u3400-\u9fff]` (i.e., BMP) to restrict the input, which is equivalent to `utf8mb3` in MySQL.
* Some use GB 18030—2005 (limited to CJK Unified Ideographs Extension B only); GB 18030—2022 is limited to Extension F only, and does not include Extensions G, H, I, and code points at the end of the block.
* Various organisations and individuals have assigned their own PUA characters which have caused many negative impacts on the information exchange of digital services.

This proposal aims to standardise the client-side input restriction and validation, and the communication with the server, to improve the Unicode usage, and to update the related constraints in time with Unicode.

In client-server communication, the anomalies in the client side, such as @@TODO@@

## Goals

Using the latest version of Unihan as the basis, standardise Chinese digital data and continuously improve the standardisation process of Chinese.

As Chinese characters will be continuously added in Unicode, and the glyphs of desktop and mobile devices may lack of update when there is no glyph in the local fonts, the user agent should not display U+FFFD or blank to the user, and should display the code point (like the behaviour of Firefox under GNU/Linux).

## Proposal

What is described herein, contains the following pre-conditions:

* It is possible to enter all Chinese characters in Unicode. For not yet encoded Chinese characters, it is generally recommended to use the correct character splitting method to represent them (for example, use `钅监` or `⿰钅监` to represent the simplified version of U+30FAB `鑑`) to reduce ambiguity and facilitate future updates.
* Unicode characters without glyphs (including future code points for Chinese) should be displayed as the code point, instead of displaying blanks or tofu that make it impossible to distinguish between different characters.
* PUA characters are not recommended for use, especially when multiple parties are using them for information exchange. However, if they are used, the assignments and glyphs should be disclosed to all users and the relevant fonts should be installed. For existing PUA characters, they should be converted to non-PUA characters periodically according to the frequency of Unicode updates.

@@TODO@@

@@TODO@@

### Client-side input validation for Chinese characters

Allow:

* [x] The input of all encoded Chinese characters in Unicode
  * `[\u4e00-\u9fff]`, i.e., Unicode 1.0 basic set and trailing urgent addition
  * `[\u3400-\u4dbf]`, i.e., CJK Unified Ideographs Extension A. The last 10 code points are very urgently needed characters.
  * `[\u20000-\u2ee5d]`, i.e., CJK Unified Ideographs Extension B-F and I
  * `[\u30000-\u323af]`, i.e., CJK Unified Ideographs Extension G-H
  * Keeping track of new Unicode versions
  * Note that very urgently needed characters may be added and encoded at the end of each block.
