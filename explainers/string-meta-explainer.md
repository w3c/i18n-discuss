# Explainer: String-Meta

The Internationalization (I18N) Working Group has been working on getting Web specifications to provide language and base direction metadata in document formats and protocols. We have a doc (String-Meta [1], see also [4]) that describes use cases and potential approaches in depth.

### What is the problem?

The display or processing of text often depends on metadata not encoded into strings of Unicode characters. Most APIs and data formats do not address the need for this metadata to be preserved or transmitted for natural language string content or, where they do, do not address these needs consistently and interoperably. 

### Why don’t document formats such as HTML have this problem?

Document formats addressed the requirement for natural language metadata by providing language and direction attributes and instructions to implementers on how to use these attributes (or suitable defaults) to achieve the desired display or processing results. These values are not usually preserved when harvesting text from document formats nor do APIs and data formats usually provide a way to deliver the values into display formats.

Many data values, of course, are not natural language text. These values do not require natural language metadata because they won’t be displayed to end users or are not expected to be handled as text in a language. These are not just pre-enumerated values but can include user defined data. For example, network `SSID` values are user assigned, composed of Unicode characters, and generally meant to be recognizable to humans, but these are not “natural language” text values.

For the subset of data values that are natural language text, however, the lack of a consistent means to encode and exchange natural language metadata in the APIs or data formats between systems means that there is effectively an “air gap” that prevents otherwise well-formed consistently-presented data from being exchanged without resorting to private use or other workarounds. In the appendix of this document we’ll present one or two examples, but for a thorough understanding, please see our above linked docs.

### What do we want TAG to do?

We would like to review our approach to this problem and discuss what the right long term approach should be in the Web platform. We believe that this is an important gap for natural language support on the Web; but we are concerned that our current approach and comments generates churn or is distracting to Working Groups attempting to complete work on specifications.

### What else are we doing? 

We approached ECMA-402 (the internationalization working group of ECMA TC39, i.e. JavaScript) about our concerns and in response to comments on webidl#1025. They are interested in potentially working to define a “localizable string” or “natural language string” data type. 

We worked with JSON-LD to define a serialization [3], but it doesn’t solve our problem in APIs.

### References 

[1] https://w3c.github.io/string-meta/
[2] https://github.com/whatwg/webidl/issues/1025
[3] https://www.w3.org/TR/json-ld/#the-i18n-namespace
[4] https://www.w3.org/International/articles/strings-and-bidi/index.en

### Appendix A. Examples

Moo
