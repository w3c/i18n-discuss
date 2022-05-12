# Explainer: String-Meta TAG Request

The [W3C Internationalization (I18N) Working Group](https://www.w3.org/International/i18n-activity/i18n-wg/) has been working on getting Web specifications to provide language and base direction metadata in document formats and protocols. We have developed [String-Meta](https://w3c.github.io/string-meta) and a [use cases](https://www.w3.org/International/articles/lang-bidi-use-cases/) document that describe requirements and potential approaches in depth.

# What is the problem?

The display or processing of text often depends on metadata not encoded into strings of Unicode characters. Most APIs and data formats do not address the need for this metadata to be preserved or transmitted for natural language string content or, where they do, do not address these needs consistently and interoperably. 

## What do we want TAG to do?

We would like TAG to review our approach to this problem and discuss what the right long term approach should be in the Web platform. We believe that this is an important gap for natural language support on the Web; but we are concerned that our current approach and comments generates churn or is distracting to Working Groups attempting to complete work on specifications.

Our immediate request has to do with [webidl#1025](whatwg/webidl#1025) wherein we requested that WebIDL add a `Localizable` type to IDL. This would allow specifications to reference this string type and save them creating a local dictionary representation. The WebIDL folks do not want to do this because it is at odds with their normal practice of providing only JavaScript primitives and types. They also don't want to become a registry of random dictionary entries.

One way to solve this would be if W3C and ECMA-402 proposed a natural language string type with these attributes to ECMA TC39. If that proposal were ultimately successful (and it will take at least one complete JavaScript release cycle to be accepted and reach the specification), then WebIDL could encode the type in their specification. This would be the most durable and platform-wide solution. On the down side, this would require probably 1-3 years before specifications would have a ready reference and it is unclear if such a type would be accepted or implemented by TC39.

Another alternative, possibly acting as a shim for eventual standardization by ECMA TC39, would be for I18N to define a dictionary and ask specifications to adopt it generally for natural language string values.

## What solutions have been considered?

Different threads have suggested different ways of providing this:

* Provide a `Localizable` dictionary definition that each Specification can define locally
* Provide a `Localizable` type in [WebIDL](https://github.com/whatwg/webidl/issues/1025) that Specifications can just reference
* Use [JSON-LD serialization forms](https://www.w3.org/TR/json-ld/#base-direction) based on the `i18n` namespace
* Use an application-specific means of encoding the values into a string’s character sequence (such as used by [WebAuthn](https://www.w3.org/TR/webauthn-2/#sctn-strings-langdir); note I18N's [comments](https://github.com/w3c/webauthn/issues?q=is%3Aissue+is%3Aopen+label%3Ai18n-needs-resolution) about this)

### What is the state of the request to WebIDL?

The sense of the thread with WebIDL is that WebIDL generally tries to encode JavaScript primitives and types, which can then be used to form complex types, rather than encoding "canned" formats for general use. They would prefer that TC39 (i.e. JavaScript) provide a native type, which could then be encoded by WebIDL, or, if we seek to define a standardized structure, that we do so using WebIDL in some referenceable way, but not as part of WebIDL itself. This is a reasonable and logical position.

### Why is it called `Localizable`?

The name `Localizable` was suggested by Marcos Caceres as part of an attempt to address our comments on Web Payments. The idea is that it represents a natural language string. Some proprietary implementations contain names like `LString` for this type of purpose. The name is not necessarily the best for this type, since "localizable" implies that the value is available in multiple languages or has other features of a localization solutions. 

Alternatives generally lean on "i18n" rather than localization. For example, see the `i18n` namespace in [JSON-LD](https://www.w3.org/TR/json-ld/#the-i18n-namespace).

### What else are we doing? 

We approached ECMA-402 (the internationalization working group of ECMA TC39, i.e. JavaScript) about our concerns and in response to comments on webidl#1025. They are interested in potentially working to define a "localizable string" or "natural language string" data type. 

We worked with JSON-LD to define a [serialization](https://www.w3.org/TR/json-ld/#the-i18n-namespace), but it doesn’t solve our problem in APIs.

## Background

### Why is this important?

Strings containing natural language text are a common type of data on the Web. Display APIs and document formats such as HTML provide the means to set the language and base direction of text. When strings are passed through data formats such as JSON and then inserted into a customer’s display, unless the language and direction metadata remain associated with the string values, there is nothing to use to set these "hooks" into the display layer. Introspection of strings to restore or detect language and base direction is difficult to accomplish and heuristics for doing this are estimates at best.

This document cannot present all of the details of why language and direction metadata are important. The below examples are just a taste of the issues. **For detailed examples and breakdown of all of the issues, see [lang-bidi-use-cases](https://www.w3.org/International/articles/lang-bidi-use-cases/).**

### Why is language information needed? What can go wrong?

Language metadata is used by user-agents to select fonts and do other text rendering tasks that are important to end users. When language metadata is missing or incorrect, the results can be damaged in appearance or functionality. 

For example, the following strings are identical. Changing the language causes the characters to render differently:
* <span lang="ja">雪, 刃, 直, 令, 垔</span>
* <span lang="zh-Hans">雪, 刃, 直, 令, 垔</span>

Other language-related operations are also affected by not having language metadata. For example, language-affected operations include (among others) hyphenation, voice browser rendering, line breaking behaviour, the rendering of quotes when using HTML's `q` element, the application of spell checking by the user-agent, the sorting of lists, or the formatting of values. Accessibility features, such as voice selection in a screen reader, depend on language information. 

### Why is base direction needed? What can go wrong?

When data is sent to a user-agent and then inserted into the display, the base text direction of the data is needed to help the Unicode Bidirectional Algorithm (UBA) lay out the text correctly. When the base direction is not set and the wrong direction is used, the results can be difficult (and sometimes impossible) to read. 

A super-simple example to illustrate how word order can change:

> Bahrain مصر Kuwait!

> &#x200f;Bahrain مصر Kuwait!

#### Why can't we just introspect the data?

Introspecting the string value itself can be difficult or unrealistic to get right. For more details and examples, see:[qa-direction-from-language](https://www.w3.org/International/questions/qa-direction-from-language)

For example, the following string starts with a Latin-script brand name, but should be interpreted to be a right-to-left Arabic string (it means roughly "Apple iPhone back and tempered glass screen protector"):

> Apple iPhone واقي شاشة زجاجي مقوى وخلفي 

### Why did "base direction" get added to I18N’s ask? Why didn’t you ask for it historically?

Language metadata is more widespread in part because I18N has been more consistent in asking for language metadata (going back decades). However, the ability to associate a language tag with a specific string is not generally present in most data formats.

Base direction metadata has gained in importance in part due to the work to define "bidi isolation" in Unicode and HTML. A common use for string data is to insert the values received into the textual content of a user interface or Web page. With bidi isolation, "spillover effects" can be avoided—but these depend in general on setting the base direction of a span of content (where previously setting the base direction did little to correct the display). The I18N WG should have been asking for base direction metadata just as much as we asked for language metadata historically, but it was the introduction of isolation that made this more critical to us.

### Why don’t document formats such as HTML have this problem?

Document formats addressed the requirement for natural language metadata by providing language and direction attributes and instructions to implementers on how to use these attributes (or suitable defaults) to achieve the desired display or processing results. These values are not usually preserved when harvesting text from document formats nor do APIs and data formats usually provide a way to deliver the values into display formats.

Many data values, of course, are not natural language text. These values do not require natural language metadata because they won’t be displayed to end users or are not expected to be handled as text in a language. These are not just pre-enumerated values but can include user defined data. For example, network `SSID` values are user assigned, composed of Unicode characters, and generally meant to be recognizable to humans, but these are not “natural language” text values.

For the subset of data values that are natural language text, however, the lack of a consistent means to encode and exchange natural language metadata in the APIs or data formats between systems means that there is effectively an “air gap” that prevents otherwise well-formed consistently-presented data from being exchanged without resorting to private use or other workarounds. In the appendix of this document we’ll present one or two examples, but for a thorough understanding, please see our above linked docs.

#### What are "spillover effects"?

One of the reasons for string data values in an API to have independant direction metadata are what we call "spillover effects". When text (such as a value returned by an API) is inserted into a larger string, the resulting string may appear scrambled due to the application of bidi. Overcoming spillover effects requires that data values inserted into the page be "bidi isolated" from the surrounding text, which, in turn, requires a base direction for the inserted value.

For example, consider the pattern string:

> السعر  # + # الشحن

This means roughly "Price x + y in shipping". When we insert the item price and shipping charge, though, we get a spillover effect:

> السعر 1,234.56 AED + 12.99 AED الشحن

An example in English would be a string like:

> {restaurantName} - {numReviews} reviews

If the restaurant's name is "פיצה סגולה" (roughly "Purple Pizza" in Hebrew) and it has 4 reviews, the rendered string can look like this:

> &#x200e;פיצה סגולה - 4 reviews

Note that the inclusion of markup doesn't necessarily cause this to be "fixed". This text:

```
&#x5e4;&#x5d9;&#x5e6;&#x5d4; &#x5e1;&#x5d2;&#x5d5;&#x5dc;&#x5d4; - <span style="color:purple">4 reviews</span>
```

Displays as:

![image](https://user-images.githubusercontent.com/69082/156616019-f2de56e6-5c55-4944-b603-97d054f0e1bd.png)

When an API returns base direction, the consumer can use that to assign base direction for inserted data, fixing the problem.

```
<span dir="rtl">&#x5e4;&#x5d9;&#x5e6;&#x5d4; &#x5e1;&#x5d2;&#x5d5;&#x5dc;&#x5d4;</span> - <span style="color:purple">4 reviews</span>
```
![image](https://user-images.githubusercontent.com/69082/156616506-825d3d70-9e50-4d61-ab86-f4d43d25a8c7.png)


### What is I18N asking Spec writers for? 

In a series of spec reviews dating back approximately four years, I18N has asked for specifications to include language and direction metadata for every natural language text string value in data structures. It seems likely that a standardized representation would help with interchange. 


# References 

* [1] https://w3c.github.io/string-meta/
* [2] https://github.com/whatwg/webidl/issues/1025
* [3] https://www.w3.org/TR/json-ld/#the-i18n-namespace
*    [3a] https://www.w3.org/TR/json-ld/#base-direction
* [4] https://www.w3.org/International/articles/strings-and-bidi/index.en
* [5] https://www.w3.org/International/articles/lang-bidi-use-cases/
* [6] https://www.w3.org/International/questions/qa-direction-from-language
* [7] https://www.w3.org/TR/webauthn-2/#sctn-strings-langdir
*    [7a] https://github.com/w3c/webauthn/issues/1644
*    [7b] https://github.com/w3c/webauthn/issues?q=is%3Aissue+is%3Aopen+label%3Ai18n-needs-resolution

