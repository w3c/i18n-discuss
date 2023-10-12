# Explainer: Why is W3C I18N trying to define a common data structure for language and direction metadata on the Web?

The [W3C Internationalization (I18N) Working Group](https://www.w3.org/International/i18n-activity/i18n-wg/) has been working on getting Web specifications to provide language and base direction metadata in document formats and protocols. We have documented our work in a Working Group Note ["String-Meta"](https://w3c.github.io/string-meta) and a [use cases](https://www.w3.org/International/articles/lang-bidi-use-cases/) document that describe requirements and potential approaches in depth. We encourage readers to seek out those documents, of which this is a summary.

## What is the problem?

The Arabic script is the second most widely used script in the world after Latin, and there are many other RTL scripts. If you try to display a string without setting the correct base direction, you will get garbled text.  For example [^1]:

<img width="702" alt="Screenshot 2023-03-02 at 11 31 37" src="https://user-images.githubusercontent.com/4839211/222420395-186bb379-ccc5-4cbb-844c-de594bc7b0d2.png">

will become the very garbled [^2]:

<img width="702" alt="Screenshot 2023-03-02 at 11 31 25" src="https://user-images.githubusercontent.com/4839211/222420448-aaed7f58-087c-4b26-91ca-d48b35dd4ebf.png">

Sometimes this problem (and others) can be avoided by setting a base direction that is the same as that of the first character in the string. However, many strings start with characters that are not representative of the string as a whole: in those cases the string has to come with metadata that indicates the expected display direction.

If you are displaying a string of Han ideographs to a user, you'll need to know which language they speak in order to get the right font. Otherwise, Japanese users will be presented with text that reads like Chinese, and vice versa. The following shows examples of characters that appear differently depending on the language:

![ja_zh_fonts](https://user-images.githubusercontent.com/4839211/222422731-8b6f4aff-599c-4326-99f0-b09811428f65.png)

As markdown:
> <span lang="ja">雪, 刃, 直, 令, 垔</span> (Japanese) [^3]

> <span lang="zh-Hans">雪, 刃, 直, 令, 垔</span> (Simplfied Chinese) [^4]

This is a problem that affects other languages besides Japanese and Chinese and the functionality includes more than just font selection: language metadata is also needed to support things like hyphenation, voice browser rendering, line breaking behaviour, spell checking, sorting  lists, or formatting values, and so on.

Because a lack of information about direction and language can cause problems for end users, we need to find solutions for the cases that fail.  That's the aim of the work described here.

## What is your goal?

At a high level, our goal is to allow natural language text data to be collected, serialized, stored, disseminated, processed, and ultimately displayed as expected across the Web platform. When data is inserted into an application (such as an HTML page) with the correct language and direction, it will be displayed in the most appropriate manner. When the metadata is missing, the results can degrade (even into illegibility).

More discretely, I18N's goal is that, for any natural language string value in a document format, it MUST be possible to know the language and base paragraph direction of that string.

## Why can't each specification define its own solution?

If each specification encodes string metadata in different ways, or if some fail to encode some or all of the metadata needed, there will be an overall loss of interoperability. Developers on the Web platform will have to learn each document format's idiosyncrasies and expend effort to map between different representations. Data that passes through formats that don't provide support will be stripped of metadata. Consistency and wide availability of a standardized solution would be the best choice.

## What are I18N's recommendations?

I18N thinks that the best path forward is to publish the following set of "best practice" patterns for Web specifications to use and then promote general adoption.

Many data values are represented by strings. When strings represent values that are just data and not human language (such as an identifier, enumerated value, or such) they can be represented as plain values and don’t require any additional metadata values:
```javascript
"id": "987-654-321.a3" // just a string with some data
```

When a string is intended to store natural language, it needs to have both a language and base paragraph direction associated with it. In JSON, this can be done by associating language and direction metadata with the string using a object:
```json
"name": {
    "value": "Here is my string",
    "lang": "en-US",
    "dir": "ltr"
}
```

This representation is at its best if there are only a few natural language strings in a given document. However, if the document contains many natural language strings, this becomes inefficient. To reduce the complexity of encoding these strings, one workaround is to establish a document-level default for language and direction. These are separate values, as language does not imply direction. There should still be the ability to override either value on any given string value:
```javascript
"language": "en-US",
"direction": "ltr",
//...
"name": "This string is in English",
"description": {
   "value": "Diese Zeichenfolge ist auf Englisch",
   "lang": "de"
}
```

The world is not monolingual. Having a single language per document would mean providing many iterations of the document, one for each language. It might also requires language negotiation at the document request level. One way to address this is to allow multilingual values for a field inside the document.
Because language selection is not merely the exact matching of language tag string values and because the normal object representation of a localized string requires that the object be deserialized in order to try and match it, it’s best if language maps are used to organize localized string values. These maps need an object on the value side of the map, since both language and direction might need to be overridden for the string value.
```json
"name": {
    "en":    {"value": "This is English"},
    "en-GB": {"value": "This is UK English", "dir": "ltr"},
    "fr":    {"value": "C'est français", "lang": "fr-CA", "dir": "ltr"},
    "ar":    {"value": "هذه عربية", "dir": "rtl"}
```

(Here is the description:)
```json
{ value: string, dir?: string, lang?: string }
```

> [!NOTE]
> It may seem odd to allow a different language tag on the "value" side of the
> language map. It is likely that this will be a rarely used feature, since its
> primary use case is allowing either foreign language text into a translation
> or modulating tools such as spell-check, hyphenation, or voice selection.
> The example given in the AppManifest meeting was the brand name "Hermes",
> which wants to be pronounced in French even when it appears in English.
> This is a rather extreme corner case and, in general, users should not use
> the override.

There are two other broadly available means of serializing multiple language values for an item. The first is to use a language map:
```json
"name": {
    "en": "This is English",
    "fr": "C'est français",
}
```

The problem with language maps is that the value is a plain string and there is no way to override the direction.

The second is to use an array of objects:
```json
"name": {
    {"value":"This is English", "lang": "en", "dir": "ltr"},
    {"value":"C'est français", "lang": "fr", "dir": "ltr"},
    ...
```

The problem with object arrays is that not only must each entry be deserialized when matching but, in order to ensure the best match, **_every_** entry must be deserialized to check whether its language tag matches better than any of the preceding entries.


## What is *language* metadata used for?

Many processes on the Web depend on accurate language metadata or language detection to get high-quality results. Some examples of this include:

* hyphenation
* first "letter" selection (such as creating drop caps)
* case folding (such as titlecasing)
* spelling correction
* font selection (including selection of fallback fonts)

### What's a good way to see the effect of missing language metadata?

The best-known visible negative impact of omitting or having the wrong language metadata appears in font selection for Chinese, Japanese, and Korean language materials using Han ideographs. Improper font selection can render certain characters illegible or difficult to read or result in unattractive "ransom note" effects. 

### Is that the only use for language metadata? What else is affected by language?

Chinese, Japanese, and Korean are not the only languages affected by language-specific font selection. Other examples include Arabic script languages (where some languages need, for example, a Nastaliq style font vs. a more general purpose font in a style such as Naskh), or a variety of languages in less common scripts, where linguistic needs are sometimes accounted for by fonts.

In addition to font selection, many application functions are linked to content language. For example, hyphenation or spell-checking depend on correct language metadata. Accessibility features, such as screen readers, need language metadata to do voice selection. Many CSS features are sensitive to language variation.

## Why do we need *base paragraph direction* metadata?

Direction metadata is needed because the Unicode Bidirectional Algorithm often needs help to get the right results for display and interpolating the value is difficult. There are two ways that base paragraph direction affects data on the Web:

First, when text is presented as paragraphs, having the correct base paragraph direction results is proper layout and overcomes problems with text that has misleading initial directional runs.

Second (and potentially more important for data on the Web), when text is _inserted_ into a page or display element (such as a larger message), the text should always be bidirectionally isolated from the surrounding message. In HTML this requires adding a `dir` attribute with a specific value. In plain text this requires adding Unicode isolating control character pairs around the string. While "first-strong" detection can sometimes provide the correct result for such placement, there are many strings where this is not the case.

### What about bidirectional text *inside* of a string? Doesn't that still need help?

Sometimes bidirectional text can fool the bidirectional algorithm, particularly when ambiguous runs of opposite direction characters appear in the text. In these cases, Unicode controls or markup is needed inside the string to get the right appearance. However, unlike base direction information, these presentational encoding tweaks are inherently part of the data. Authors can be expected to provide appropriate controls and expect them to be transmitted just like the visible characters in the text.

### Why don't we just require implementations to wrap text in bidi controls?

Generally speaking, most specifications for APIs or data format should not require implementations to modify the data values passing through them except where this would violate an application's constraints. Adding bidirectional controls actually changes the data from what is stored on the sending end. It also requires accurate knowledge of the base direction (and introspection of the data in case controls are already present). Implementations receiving such data can't know if the controls or markup was part of the original data (and thus intentional) or was added by an interstitial process. Addition of controls also invites perverse cases of multiple wrapping. And, of course, some implementations need to run on resource constrained devices that might have a hard time doing any of this.

## Why didn't you ask for direction metadata earlier?

We didn't identify this as a problem early enough. The need for base direction metadata grew out of efforts by the bidi community to improve usability in HTML. This lead to improvements and changes in the Unicode Bidirectional Algorithm and a better understanding of the difficulties faced by bidi language speakers.

By contrast, I18N has asked for language metadata dating back over 30 years. As a result, such metadata is widely available in structured document formats and many protocols. Base direction metadata is less prevalent and I18N's request for this metadata was less consistent prior to work on HTML5.

## Are there other alternatives? What other solutions have been considered?

Yes. The other options for providing base direction metadata on the Web include:

* Provide a `Localizable` dictionary definition that each Specification can define locally. _While this would be effective in addressing the needs of a given API or document format, interoperability might be harmed since there would be no built-in support in core libraries and since mapping between specifications/APIs/formats would have to be done manually._
* Provide a `Localizable` type in [WebIDL](https://github.com/whatwg/webidl/issues/1025) that Specifications can just reference. _This would be effective for specifications that use IDL, but might not address the needs found in libraries, runtimes, etc. Also, IDL tries to mirror what ECMAScript does._
* Use [JSON-LD serialization forms](https://www.w3.org/TR/json-ld/#base-direction) based on the `i18n` namespace. _This solution is already effective for JSON-LD, but is limited to JSON-LD._
* Use an application-specific means of encoding the values into a string’s character sequence (such as used by [WebAuthn](https://www.w3.org/TR/webauthn-2/#sctn-strings-langdir); note I18N's [comments](https://github.com/w3c/webauthn/issues?q=is%3Aissue+is%3Aopen+label%3Ai18n-needs-resolution) about this). _This solution solves a specifications immediate local needs, but does not address interoperability concerns._


### What else is I18N doing? 

We worked with JSON-LD to define a [serialization](https://www.w3.org/TR/json-ld/#the-i18n-namespace), but it doesn’t solve our problem in APIs.

We have also worked with a variety of WGs on serialization forms as workarounds. Notable recent efforts include RDF-star and Webapp Manifest.

## Why can't we just introspect the data?

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

Many data values, of course, are not natural language text. These values do not require natural language metadata because they won’t be displayed to end users or are not expected to be handled as text in a language. These are not just pre-enumerated values but can include user defined data. For example, network `SSID` values are user assigned, composed of Unicode characters, and generally meant to be recognizable to humans, but these are not "natural language" text values.

For the subset of data values that are natural language text, however, the lack of a consistent means to encode and exchange natural language metadata in the APIs or data formats between systems means that there is effectively an "air gap" that prevents otherwise well-formed consistently-presented data from being exchanged without resorting to private use or other workarounds. In the appendix of this document we’ll present one or two examples, but for a thorough understanding, please see our above linked docs.



_Feel free to paste the above texts into our [playground page](https://w3c.github.io/i18n-discuss/explainers/bidi-html-demo.html) or choose examples from the drop down box. Screen shots in this section were taken from the playground page in Firefox/Windows._

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

---
<!-- footnotes -->

[^1]: [Example 1](https://w3c.github.io/i18n-discuss/explainers/bidi-html-demo.html?item=4&dir=rtl)
[^2]: [Example 2](https://w3c.github.io/i18n-discuss/explainers/bidi-html-demo.html?item=4&dir=ltr)
[^3]: [`ja` Example](https://w3c.github.io/i18n-discuss/explainers/bidi-html-demo.html?item=5&selectLang=ja)
[^4]: [`zh-Hans` Example](https://w3c.github.io/i18n-discuss/explainers/bidi-html-demo.html?item=5&selectLang=zh-Hans)
