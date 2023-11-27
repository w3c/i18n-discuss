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

In client-server communication, the anomalies in the client side, such as appropriate prompts should be given for abnormalities entered at the client side, such as duplicate encoded ideographs, non-standard ideographs, PUA characters, and so on, in order to avoid the proliferation of errors.

## Goals

Using the latest version of Unihan as the basis, standardise Chinese digital data and continuously improve the standardisation process of Chinese.

As Chinese characters will be continuously added in Unicode, and the glyphs of desktop and mobile devices may lack of update when there is no glyph in the local fonts, the user agent should not display U+FFFD or blank to the user, and should display the code point (like the behaviour of Firefox under GNU/Linux).

## Proposal

What is described herein, contains the following pre-conditions:

* It is possible to enter all Chinese characters in Unicode. For not yet encoded Chinese characters, it is generally recommended to use the correct character splitting method to represent them (for example, use `钅监` or `⿰钅监` to represent the simplified version of U+30FAB `鑑`) to reduce ambiguity and facilitate future updates.
* Unicode characters without glyphs (including future code points for Chinese) should be displayed as the code point, instead of displaying blanks or tofu that make it impossible to distinguish between different characters.
* PUA characters are not recommended for use, especially when multiple parties are using them for information exchange. However, if they are used, the assignments and glyphs should be disclosed to all users and the relevant fonts should be installed. For existing PUA characters, they should be converted to non-PUA characters periodically according to the frequency of Unicode updates.

@@TODO@@

For duplicate encoded ideographs already in Unicode, they should be normalised in the same way as in the ctext project (see 3.6 and `[R10]`).

### Client-side input validation for Chinese characters

Allow:

* [x] The input of all encoded Chinese characters in Unicode
  * `[\u4e00-\u9fff]`, i.e., Unicode 1.0 basic set and trailing urgent addition
  * `[\u3400-\u4dbf]`, i.e., CJK Unified Ideographs Extension A. The last 10 code points are very urgently needed characters.
  * `[\u20000-\u2ee5d]`, i.e., CJK Unified Ideographs Extension B-F and I
  * `[\u30000-\u323af]`, i.e., CJK Unified Ideographs Extension G-H
  * Keeping track of new Unicode versions
  * Note that very urgently needed characters may be added and encoded at the end of each block.
* [x] 12 code points in the CJK Compatibility Ideographs block included by Unicode `p{Ideo}`: 﨎﨏﨑﨓﨔﨟﨡﨣﨤﨧﨨﨩
* [x] Name separators (U+00B7 [·]) in personal name scenarios
* [x] In extreme cases, ideographic variation sequences may be used to display the correct variant glyph (e.g. Macau government services)

Restrictions:

* Restrict the input and use of other code points in the CJK Compatibility Ideographs block (e.g., those from Japanese character encodings);
* Restrict the use of Chinese characters in PUA and make the glyphs publicly available to all parties; set rules for Chinese characters in PUA to regularly track the latest Unicode release and migrate the data;
* Restrict the use of Kangxi radical characters to radical-specific areas. In general-purpose environments, only use the usual Chinese characters to avoid ambiguity and possible legal disputes, and to reduce additional communication costs.

#### Optimisation of the rendering of missing-glyph Chinese characters

Because of the continuous expansion of Unicode Chinese characters, many old systems won't have glyphs for some recently encoded Chinese characters. These characters are often displayed as `U+FFFD REPLACEMENT CHARACTER`, `U+2612 BALLOT BOX WITH X`, or blank, resulting in the user not being able to identify the specific content.

Firefox on Linux renders the code point in order to avoid mapping a glyph to thousands or tens of thousands of different Chinese characters, because it can not be recognised by the user normally.

#### UI optimisation

Where there are specification requirements, for variant characters (e.g., 戶 and 戶), wrongly written characters (e.g., 𪚔 should be 龑), duplicate encoded characters (e.g., U+363D and U+39B3 [㦳](https://ctext.org/dictionary.pl?if=en&char=%E3%A6%B3), only the former should be used after normalisation), PUA characters (e.g., in GBK-1995, U+E863 should be U+4DAE `䶮`), and compatibility ideographs other than the 12 characters mentioned above, etc., the necessary normalisation should be done, and users should be given sufficient hints. The hints have the following categories:

* PUA: If there is an official code point, the server should store it using the official code point and inform the user to use the official code point; if there is no official code point, the website or the user agent should suggest that it can't be used for the exchange of information, and should be replaced by using the correct character splitting method or pinyin.
* Irregular variants and compatibility ideographs: hints according to local language specifications
* Wrongly written characters: prompt to ask the user to use the correct standardised character
* Duplicate encoded characters: prompt to ask the user to use the correct character
* Kangxi radicals: in personal names and other non-radical use cases, ask the user to use the normal Chinese characters.

Another issue of concern is the IVS mechanism for handling variant characters. According to The Unicode Standard, variants can handled using VS1–VS16 (U+FE00 through U+FE0F) and VS17–VS256 (U+E0100 through U+E01EF):

* VS1-VS16 are only used for compatibility ideographs, 'Phags-pa letters, and emoji, generally called standardized variation sequences (SVS), of which VS15-VS16 are only used for emoji
* VS17-VS256 are used for @@TODO@@

Variation selectors and the previous code point should be rendered, printed, and processed as a single "character". Glyphs exist in the .ttf file in the form of Format 14. When doing string searching operations, the first code point should be the processing baseline. For example, if the two Chinese characters appear together, such as "龍VS天" (U+9F8D U+E0100 U+5929), typing "龍天" would find "龍VS天". The user agent can also have a method for precise query.

@@TODO@@

#### Filtering implementation

This may vary from programming language to programming language, refer to [R11-R14] for generic JavaScript as an example.

1. UTF-16 surrogates method: use `[\uD800-\uDFFF]` for SIP and TIP, which can be difficult to handle when controlling the scope.
2. Character method: starting and ending Chinese characters such as `[一-龥]`, which uses UTF-8 encoding, but not intuitive enough from a readability perspective.
3. `u` flag method: `[\u{20000}-\u{3ffff}]` for SIP and TIP, easier to read
4. Unicode Script method, with the `u` flag:
  * `\p{UIdeo}`: all Unicode official Chinese characters, including 12 compatibility ideographs
  * `\p{Ideo}`: @@TODO@@
  * `\p{Han}`: contains all Chinese characters and radicals in the compatibility block
  * `\p{PUA}`: Private Use Area in the Basic Multilingual Plane

Method 4 should be used.

Example of actual ranges of `\p{UIdeo}` in Unicode 15.1:

![Unified CJK Ideographs](chinese-client-server-data/uideo.png "Unified CJK Ideographs")

#### Chinese input methods

1. Ordinary keyboard input
2. Machine-readable digital input (such as NFC)
3. Handwriting input
4. OCR input
5. Voice input

3-5 are not within the scope of this project because they involve other technologies and cannot be accurate enough.

Regarding #1, if Pinyin input cannot be used normally, it is recommended to add split-character Pinyin and shape-based input methods such as Wubi and Cangjie. In extreme cases, Unicode code point input can supported. For example, in Microsoft Pinyin IME, `vuc20164` can be used to input `𠅤`.

In modern life, more and more machine-readable methods are used for input (such as ID cards, electronic ID cards, QR codes, etc.), which should generally be completely transmitted to the server. The original information must not be lost due to encoding conversion, such as converting UTF-8 Chinese characters into GBK "?" (0x3F). For errors in the original the machine-readable information, the issuer should be contacted for correction.

#### Compatibility processing mechanism in client and server side

@@TODO@@

## Key scenarios

There are three types of Chinese form input scenarios:

@@TODO@@

### Scenario 1

@@TODO@@

### Scenario 2

@@TODO@@

### Scenario 3

@@TODO@@

## Detailed design discussion

@@TODO@@
