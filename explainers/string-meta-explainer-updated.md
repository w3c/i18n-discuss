# Explainer: Why is W3C I18N trying to add language and direction metadata to the Web?

The [W3C Internationalization (I18N) Working Group](https://www.w3.org/International/i18n-activity/i18n-wg/) has been working on getting Web specifications to provide language and base direction metadata in document formats and protocols. We have documented our work in a Working Group Note ["String-Meta"](https://w3c.github.io/string-meta) and a [use cases](https://www.w3.org/International/articles/lang-bidi-use-cases/) document that describe requirements and potential approaches in depth. We encourage readers to seek out those documents, of which this is a summary.

# What is the problem?

The display or processing of text often depends on metadata not encoded into strings of Unicode characters. Many Web APIs and data formats do not address the need for this metadata to be preserved or transmitted for natural language string content or, where they do, do not address these needs consistently and interoperably. Detailed examples are provided in our [use cases document](https://www.w3.org/International/articles/lang-bidi-use-cases/).

Our goal is to allow natural language text data to be collected, serialized, stored, disseminated, processed, and ultimately displayed as expected across the Web platform. When data without language or direction metadata is inserted into an HTML page, if that text is labeled with the correct language tag and bidi isolated with the correct base direction, it will be displayed in the most appropriate manner. When the metadata is missing, the results can degrade (even to the point of illegibility).

If each specification were left to their own devices, we might end up with a myriad of different ways of encoding the language and direction metadata on the Web. Mapping this data through various specs, standards, and implementations would require greater care on the part of developers. Specifications or implementations that didn't adopt metadata might serve effectively as "filters", removing the metadata in some mid-stream process, rendering the work of others moot. So consistency and wide availability of a standardized solution would be the best choice.

Generally speaking, I18N has asked for language metadata dating back over 30 years. As a result, such metadata is widely available in structured document formats and many protocols. Base direction metadata is less prevalent and I18N's request for this metadata was less consistent prior to work on HTML5.

## The core bidi example

To understand the need for directional metadata, we have to think about the lifecycle of data in an application. While page authors using HTML now have the tools to manage and display bidirectional text when composing a page, this isn't always true when an application is retrieving data from various services or databases and composing the page at runtime. In our document [Strings on the Web: Language and Direction Metadata](https://w3c.github.io/string-meta) (aka `String-Meta`), we use the example of an on-line book catalog.

One data structure you might find in this catalog might look something like this:

```json
{
    "id": "978-111887164-5",
    "title": "HTML \u0648 CSS: \u062a\u0635\u0645\u064a\u0645 \u0648 \u0625\u0646\u0634\u0627\u0621 \u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0648\u064a\u0628!",
    "authors": [ "Jon Duckett" ],
    "language": "ar",
    "pubDate": "2008-01-01",
    "publisher": "مكتبة",
    "coverImage": "https://example.com/images/html_and_css_cover.jpg",
    // etc.
},
```

Here we have used `\u` escapes for the Arabic in the book title to prevent any bidi issues in displaying the title here. When converted into a string and correctly presented in Arabic, the title looks like this:

> ⁧HTML و CSS: تصميم و إنشاء مواقع الويب!⁩

The equivalent title in English would be:

> HTML and CSS: Design and Build Websites!

The correct presentation of the Arabic title in this explainer was achieved by inserting bidirectional control characters around the string. These characters will not exist in normal data and should not be inserted into the data itself. However, without the controls, the display of the string is not correct:

> HTML و CSS: تصميم و إنشاء مواقع الويب!

This may not be immediately apparent if you do not speak or read Arabic, since the English words `HTML` and `CSS` and the `:` and `!` appear to be correctly positioned for your English language expectations. However, the last word in the title is actually the one directly to the right of the colon. Try using your mouse to select the text and observe how the bidi behaves.

If we retrieve the JSON record in the example and attempt to display it into an English (or other _ltr_ language) page, the resulting HTML fragment might look like this:

```html
<p>You purchased "HTML و CSS: تصميم و إنشاء مواقع الويب!" today.</p>
```

If we present that string in an RTL context (perhaps the string hasn't been localized into Arabic yet), it can look like this:

![image](https://user-images.githubusercontent.com/69082/221299274-4dce7520-08f7-4a04-a3bb-a3acc147fc0c.png)

... which is illegible. To avoid problems like this, we need to provide bidirectional isolation for string data values inserted at runtime and this requires direction metadata to get the correct result. Notice that our example title starts with a strongly _ltr_ word: `HTML`, so heuristics that look at the "first strong" character in the string will be fooled by the Latin-script acronym "HTML".

To complete the set, here's an approximate translation of the string into Arabic:

> لقد اشتريت "HTML و CSS: تصميم و إنشاء مواقع الويب!" اليوم

Which can look like this when presented in an LTR page:

![image](https://user-images.githubusercontent.com/69082/221300949-7801e8ba-ff9c-4358-9315-f7673df5e702.png)

What should happen when inserting the data into the page is that the application surrounds the title with an element (such as `span`) with a `dir` attribute. Doing so in HTML5 results in bidi isolation and the correct display of the title *and* its surrounding string, with no spillover effects. Here we use the `cite` element:

```html
<pYou purchased <cite dir=rtl>HTML و CSS: تصميم و إنشاء مواقع الويب!</cite> today.</p>
```

The results might look something like this:

![image](https://user-images.githubusercontent.com/69082/221372930-095021d6-4850-4978-93f9-0f8a9bba6c8a.png)


## What is *language* metadata used for anyway?

Many processes on the Web depend on accurate language metadata or language detection to get high-quality results. Some examples of this include:

* hyphenation
* first "letter" selection (such as creating drop caps)
* case folding (such as titlecasing)
* spelling correction
* font selection (including selection of fallback fonts)

## Is language metadata mainly or only for CJK font selection?

No.

The best-known visible negative impact of omitting or having the wrong language metadata appears in font selection for Chinese, Japanese, and Korean language materials using Han ideographs. Improper font selection can render certain characters illegible or difficult to read or result in unattractive "ransom note" effects. However, these are not the only languages affected by language-specific font selection. Other examples include Arabic script languages (where some languages need, for example, a Nastaliq style font vs. a more general purpose font in a style such as Naskh), or a variety of languages in less common scripts, where linguistic needs are sometimes accounted for by fonts.

## Why do we need *base paragraph direction* metadata?

Direction metadata is needed because the Unicode Bidirectional Algorithm often needs help to get the right results for display and interpolating the value is difficult. There are two ways that base paragraph direction affects data on the Web:

First, when text is presented as paragraphs, having the correct base paragraph direction results is proper layout and overcomes problems with text that has misleading initial directional runs.

Second, when text, such as from an API, is _inserted_ into a page or display element (such as a larger message), the text should always be bidirectionally isolated from the surrounding message. In HTML this requires adding a `dir` attribute with a specific value. In plain text this requires adding Unicode isolating control character pairs around the string. While "first-strong" detection can sometimes provide the correct result for such placement, there are many strings where this is not the case.

## Why are we asking for a new string data type?

Mainly we're asking because WebIDL wants it. What I18N actually wants is for specs and standards on the Web to consistently provide `language` and `direction` metadata fields for natural language string values. For Javascript and JSON based data structures and formats, this could take the form of a `Dictionary` or other standardized set of values that can be included into a field by reference.

We thought the best location for such a pre-defined pseudo-type would be the [WebIDL specification](https://webidl.spec.whatwg.org), since many specs use IDL to describe their own data structures or interfaces for their APIs. However, WebIDL's maintainers want to restrict types to those defined by EMCAScript proper. Various groups, including TAG, concur with this idea, leading to our request for a datatype.

> stopped here

## Are there other alternatives?

## How would adoption work?

## What about specs that don't understand the new type? What about existing standards?

## What do we want TC39 and ECMA-402 to do?

We would like ECMAScript to add a new datatype for [natural language](https://www.w3.org/TR/i18n-glossary/#def_natural_language) strings that, in addition to existing `String` methods, includes attributes for language and base direction, plus appropriate methods for interacting with these attributes.

We have reached a rough consensus with W3C TAG and several working groups that this is a desirable approach to the problem of consistent interchange of natural language strings. Such a datatype might also be consistent with or leverage work done by Unicode's MessageFormat working group and potentially related work at ECMA-402 in support of localization and runtime string formatting. However, these would be "nice-to-have" from our point of view.

A model for such a datatype can be found in [webidl#1025](https://github.com/whatwg/webidl/issues/1025), wherein we requested that WebIDL add a `Localizable` type to IDL. Our goal in defining a datatype via core standards, such as EMCAScript and WebIDL, is to avoid having each specification define its own (possibly different) natural language string definition. This would promote interoperability. TAG agrees that the next step would be for TC39 to consider such an addition.

## What solutions have been considered?

Different threads have suggested different ways of providing this:

* Provide a `Localizable` dictionary definition that each Specification can define locally. _While this would be effective in addressing the needs of a given API or document format, interoperability might be harmed since there would be no built-in support in core libraries and since mapping between specifications/APIs/formats would have to be done manually._
* Provide a `Localizable` type in [WebIDL](https://github.com/whatwg/webidl/issues/1025) that Specifications can just reference. _This would be effective for specifications that use IDL, but might not address the needs found in libraries, runtimes, etc. Also, IDL tries to mirror what ECMAScript does._
* Use [JSON-LD serialization forms](https://www.w3.org/TR/json-ld/#base-direction) based on the `i18n` namespace. _This solution is already effective for JSON-LD, but is limited to JSON-LD._
* Use an application-specific means of encoding the values into a string’s character sequence (such as used by [WebAuthn](https://www.w3.org/TR/webauthn-2/#sctn-strings-langdir); note I18N's [comments](https://github.com/w3c/webauthn/issues?q=is%3Aissue+is%3Aopen+label%3Ai18n-needs-resolution) about this). _This solution solves a specifications immediate local needs, but does not address interoperability concerns._

### What is the state of the request to WebIDL?

The sense of the thread with WebIDL is that WebIDL generally tries to encode JavaScript primitives and types, which can then be used to form complex types, rather than encoding "canned" formats for general use. They would prefer that TC39 (i.e. JavaScript) provide a native type, which could then be encoded by WebIDL, or, if we seek to define a standardized structure, that we do so using WebIDL in some referenceable way, but not as part of WebIDL itself. This is a reasonable and logical position.

### Why is the WebIDL proposal called `Localizable`?

The name `Localizable` was suggested by Marcos Caceres as part of an attempt to address our comments on Web Payments. The idea is that it represents a natural language string. This name is "interface-like", in that a Specification could define a field to be "localizable", meaning it had the `language` and `direction` attributes, perhaps among other attributes.

The I18N WG is not keen on this as the name of an ECMAScript datatype. `Localizable` implies that the value is available in multiple languages or has other features of various localization solutions. Some alternatives might be:

* `LString`. Some proprietary implementations contain names like `LString` for this type of purpose. 
* `I18nString`, `IString`, `Intl.String`. Alternatives generally lean on "i18n" rather than localization. For example, see the `i18n` namespace in [JSON-LD](https://www.w3.org/TR/json-ld/#the-i18n-namespace). Some variations in this vein might make more sense.

### What else are we doing? 

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

A super-simple example to illustrate how the _apparent_ word order can change:

> Bahrain مصر Kuwait!

> &#x200f;Bahrain مصر Kuwait!

#### Why can't we just introspect the data?

Introspecting the string value itself can be difficult or unrealistic to get right. For more details and examples, see:[qa-direction-from-language](https://www.w3.org/International/questions/qa-direction-from-language)

For example, the following string starts with a Latin-script brand name, but should be interpreted to be a right-to-left Arabic string (it means roughly "Apple iPhone back and tempered glass screen protector"). Because the string starts with a strong LTR character (the `A` in `Apple`) it instead gets interpreted as LTR:

**Incorrect (LTR)**

> Apple iPhone واقي شاشة زجاجي مقوى وخلفي 

**Correct (RTL)**

> &#x200f;Apple iPhone واقي شاشة زجاجي مقوى وخلفي 

### Why did "base direction" get added to I18N’s ask? Why didn’t you ask for it historically?

Language metadata is more widespread in part because I18N has been more consistent in asking for language metadata (going back decades). However, the ability to associate a language tag with a specific string is not always present in data formats.

Base direction metadata has gained in importance in part due to the work to define "bidi isolation" in Unicode and HTML. A common use for string data is to insert the values received into the textual content of a user interface or Web page. With bidi isolation, "spillover effects" can be avoided&mdash;but these depend on setting the base direction of a span of content (where previously setting the base direction did little to correct the display). While many strings can use _first-strong_ heuristics (by using the value `auto` for HTML's `dir` attribute), some strings, such as those illustrated in this document, depend on correct metadata values. The I18N WG should have been asking for base direction metadata just as much as we asked for language metadata historically, but it was the introduction of isolation that made this more critical to us.

### Why don’t document formats such as HTML have this problem?

Document formats addressed the requirement for natural language metadata by providing language and direction attributes and instructions to implementers on how to use these attributes (or suitable defaults) to achieve the desired display or processing results. These values are not usually preserved when harvesting text from document formats nor do APIs and data formats usually provide a way to deliver the values into display formats.

Many data values, of course, are not natural language text. These values do not require natural language metadata because they won’t be displayed to end users or are not expected to be handled as text in a language. These are not just pre-enumerated values but can include user defined data. For example, network `SSID` values are user assigned, composed of Unicode characters, and generally meant to be recognizable to humans, but these are not “natural language” text values.

For the subset of data values that are natural language text, however, the lack of a consistent means to encode and exchange natural language metadata in the APIs or data formats between systems means that there is effectively an “air gap” that prevents otherwise well-formed consistently-presented data from being exchanged without resorting to private use or other workarounds. In the appendix of this document we’ll present one or two examples, but for a thorough understanding, please see our above linked docs.

#### What are "spillover effects"?

One of the reasons for string data values in an API to have independant direction metadata are what we call "spillover effects". When text (such as a value returned by an API) is inserted into a larger string, the resulting string may appear scrambled due to the application of bidi. Overcoming spillover effects requires that data values inserted into the page be "bidi isolated" from the surrounding text, which, in turn, requires a base direction for the inserted value.

For example, consider the Arabic language pattern string:

> السعر  # + # الشحن

This means roughly "Price {item_price} + {ship_amt} in shipping". When we insert the item price (let's say it is `1234.56 AED`) and shipping charge (let's say it is `12.99 AED`), though, we get a spillover effect:

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

