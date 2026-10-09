# Explainer: Message Resources

The purpose of this effort is to develop the specification
for a **_message resource_** as a standard container for [Unicode MessageFormat] ("MF2") messages.
The serialized form of a message resource may be used as a file format.

[unicode messageformat]: https://github.com/unicode-org/message-format-wg

In this context, a "resource" is a collection of related messages
that may need to be stored, transmitted and/or handled together.
A resource may classify its messages into groupings,
and it may include additional data or metadata relating to them.
It should be possible to represent a resource in a text-based human-friendly manner.

This work has been [presented](https://www.youtube.com/watch?v=ksgm_B-uUCU)
at the [2024 Unicode Tech Workshop](https://www.unicode.org/events/utw/2024/),
and accepted for incubation by the W3C Internationalization WG at TPAC 2025.

Message resources are a prerequisite for [DOM Localization].

[dom localization]: https://github.com/mozilla/explainers/blob/main/dom-localization.md

## Why?

The prior work on a new message format has identified the following challenges
that go beyond or arise from defining the syntax and behavior of a single message,
but which are not well addressed by existing resource formats:

- The Unicode MessageFormat message syntax is naturally multi-line due to its internal structure,
  and multi-line values are not easy to use in many of the current resource formats.
- Comments and metadata (set either by automation or manually)
  are an important means for translators and developers to communicate with one-another,
  but are irrelevant to the retrieval and display of the message.
  Their attachment to messages needs to be well specified,
  while being easy to read, write, and ignore.
- Structured metadata needs a common schema in order to be universally understood.
- Hierarchical groupings of messages need to be representable,
  and metadata be assignable not only to individual messages,
  but also groups of messages.
- Many localizable messages need to be composed together
  (such as an HTML element with a localizable body and localizable attributes),
  and it should be possible to express a compound message formed of multiple connected parts.
  While Unicode MessageFormat does support e.g. markup elements with option values,
  this may make it difficult to segment a message's localizable parts from each other.
- A purpose-built localization resource format should be well specified,
  and designed from the ground up to work with multiple implementations.
  Its design and capabilities need to account for existing localization formats,
  and allow for the representation of messages and resources in those formats.

Some of these aspects are well supported by existing formats,
but no one resource format serves all of the identified use cases.

## Alternatives Considered

A number of text-based file formats already exist that have been designed for localization, including:

- Android string resources (strings.xml)
- Fluent FTL (.ftl)
- Gettext PO File Format (.po, .pot)
- Java properties (.properties)
- Ruby i18n locale files (.yml)
- Web extension JSON (messages.json)
- Xcode string catalogs (.xcstrings)
- XLIFF (.xlf, .xliff, application/xliff+xml)

Many (but not all) of these are based on JSON or XML as a base format,
and can be represented by defining a JSON or XML schema for them.
However, while JSON and XML are relatively easy to read, they are not easy to _write_.
This is a disadvantage to users, such as developers or translators,
who expect to use existing editors, especially simple text editors,
to create and manage these files.
JSON/XML schemas should be defined as a part of the effort,
to represent a data model view of the resource formats,
complementing the [message data model].

It should be specifically noted that while XLIFF is an [OASIS Standard],
it is an XML-based format that is not designed for human authoring,
but primarily for use as a machine interchange format.

Furthermore, many of the file formats tie in with some specific localization system,
and are not easily generalisable for use outside it.
Such tight coupling makes them incompatible with use as general-purpose message resource formats.

After leaving out JSON and XML -based formats and other tightly coupled formats,
only Java .properties and Gettext .po/.pot files remain as candidates for consideration.

[Java .properties] only support key-value pairs and unattached comments,
which is not sufficient for representing comments that relate to a specific message,
or for representing the metadata relating to a message, or the resource as a whole.

[Gettext .po/.pot files] are perhaps the most common localization file format in current use,
as they do not effectively have any viable alternatives.
Structurally, the format provides many of the features that are required here:

- Comments come in multiple types and each clearly attaches to the following entry.
- The resource starts with a header,
  which can represent comments and metadata relating to the resource as a whole.
- Multi-line values are supported.

However, the Gettext format also has some issues in this context:

- Messages are usually identified by their full source string contents,
  rather than an explicit string identifier.
  In addition to leaving out a possibly important indicator of the message's usage,
  this underlines the expectation that the file format is used for translation,
  and that the base source of truth for messages is inline in code elsewhere.
- The only capability for hierarchically grouping messages is by defining each message's `msgctxt` value.
- The built-in support for plural variance depends on
  inlining a snippet of C code that defines an integer `plural` value,
  rather than depending on the locale-specific CLDR plural keys that are now available.
- The built-in support for plural variance effectively expects for the source language to
  always be English, or at the very least a language
- The syntax used within a message needs to be separately defined for each message.
- Representing multi-line messages requires wrapping each line separately with `"`...`\n"`.
- The format has evolved and [is evolving][po-evolution] as a part of the Gettext localization system
  since its inception in the 1990s, with new features getting added on top of old ones,
  rather than having been designed with them from the start.
  For instance, resource headers are defined by
  defining a translation for an empty `msgid ""` at the top of the file,
  using a syntax reminiscent of HTTP headers.

It is possible to include MF2 messages in a .po file, including metadata,
but this ends up being rather clumsy in practice.
For example, here's how a message with a plural selector would end up looking like,
when translated into Finnish:

```pot
#, mf2-format
msgid ""
  ".input {$count :integer}\n"
  ".match $count\n"
  "0   {{You have no messages.}}\n"
  "one {{You have {$count} message.}}\n"
  "*   {{You have {$count} messages.}}"
msgstr ""
  ".input {$count :integer}\n"
  ".match $count\n"
  "0   {{Sinulla ei ole viestejä.}}\n"
  "one {{Sinulla on {$count} viesti.}}\n"
  "*   {{Sinulla on {$count} viestiä.}}"
```

This representation needs to explicitly leave out the format's built-in plural variance support,
and with the tools that are commonly used with the format,
it'll consider e.g. changes in whitespace in the source message to always be significant,
even if they do not change the message's [data model representation][message data model] at all.

For localizing the web, we can and should provide a better solution,
in particular one that's better suited for [DOM Localization].

[Gettext .po/.pot files]: https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html
[Java .properties]: https://docs.oracle.com/en/java/javase/27/docs/api/java.base/java/util/Properties.html#load(java.io.Reader)
[message data model]: https://github.com/unicode-org/message-format-wg/tree/main/spec/data-model
[po-evolution]: https://www.gnu.org/software/gettext/manual/gettext.html#Evolution-of-the-PO-File-Format
[OASIS Standard]: https://docs.oasis-open.org/xliff/xliff-core/v2.1/os/xliff-core-v2.1-os.html

## Paths to Adoption

The field of localization is not new, and already features many competing solutions,
with workflows, tools and practices used by many different projects,
each of which have different needs.
In this environment, a new solution should not aim to replace all parts at once,
but to provide a modular, layered approach that users could benefit from
without needing to adopt all parts of the new standard.

This approach is already fundamental to the Unicode MessageFormat specification,
which is designed to be embeddable in any existing resource formats.
The resource format work should follow a similar approach,
for example by ensuring that its data model provides not only a useful representation
of any syntax representation of a resource format defined here,
but also all existing resource formats.
Doing so makes it much easier for resource format conversion tools to be built,
not only to and from the new format, but also between existing formats.

Similarly, a well-defined set of message properties or metadata
could be adopted completely separately from the rest of the specification.
It could be defined within the context of the new resource format,
or as a separate action by the [Unicode MessageFormat WG][unicode messageformat].

## Non-Goals

At least initially, the work should focus on the definition of
the data held within a localization resource, including its data model representation,
but not on how that data is to be processed.
In other words, a message resource specification should not mandate
the runtime behaviour of a message formatter or other tool processing said data.

The following are therefore explicitly left out of scope:

- Whether and how multiple resources could be bundled together at runtime.
- Whether and how to perform fallback between locales if a resource is incomplete for a first-choice locale.
- Whether and how to query and iterate messages within a resource.

The adoption and usage of message resources for [DOM Localization]
is expected to answer many of these questions in the context of their use on the web.

## Proposed Solution

Within the overall purpose of defining a new resource format,
the work can be split into the following parts:

1. Defining the resource syntax.
2. Defining the data model representation of a resource.
3. Defining or adopting a vocabulary for message and resource properties/metadata.

While the primary driver for the work is to support Unicode MessageFormat,
other current and future localization formats also need to be considered.
For example, it should be possible to:

- represent a Gettext `.po` file using the data model,
- use the same message properties within some other custom resource format, and
- embed messages with a different format than MF2 in a message resource.

The definition of a resource loader is not within the scope of this work,
except insofar as its concerns impact the deliverables enumerated above.

The definition of message and resource properties is currently
[under consideration](https://github.com/unicode-org/message-format-wg/pull/1098)
as a work item of the Unicode MessageFormat WG,
and hence is not included here.

### Syntax

As currently proposed,
a message resource looks like this
(syntax highlighting only approximate):

<!-- {% raw %} -->

```ini
# The resource-level locale is the only required property.
@locale en-US
---

one = A plain, simple message.

@param $placeholder - A comment on the placeholder value.
two = Another message with a {$placeholder}.

@param $foobar - An input parameter
                 with a multiline description
three = Some {$foobar} message
  with a multiline value
  \  and a third line that starts with two spaces.

[section]

four =
  .input {$count :integer}
  .match $count
  0   {{You have no messages.}}
  one {{You have {$count} message.}}
  *   {{You have {$count} messages.}}

@do-not-translate
[section.more]

# This message (section.more.five) should not be modified from the original.
five = Foo
```

<!-- {% endraw %} -->

This represents five `en-US` messages with keys `one`, `two`, `three`, `section.four`, and `section.more.five`.
The comments and `@properties` each attach to the next
section header, message entry, or resource frontmatter separator (not separated by whitespace).
Properties and message values may be multiline, provided that each of the following lines is indented by some whitespace.
All leading whitespace is trimmed from each line, unless it's escaped with `\`.

The exact syntax for properties and
[message values](https://github.com/unicode-org/message-format-wg/blob/main/spec/syntax.md)
is defined separately.
The canonical definition of the resource syntax is found in [`message-resource.abnf`](./message-resource.abnf).

### Data Model

A message resource data model corresponding to the syntax definition
is included as [`message-resource.d.ts`](./message-resource.d.ts),
an extensively commented TypeScript definition.

To enable interchange, a JSON Schema definition of the data model
is also provided in [`message-resource.json`](./message-resource.json).
This corresponds to `Resource<Message>`
in the parametric TypeScript definition,
where `Message` is a [Unicode MessageFormat Message](https://github.com/unicode-org/message-format-wg/blob/main/spec/data-model/README.md#messages).

As with the Unicode MessageFormat data model,
the message resource JSON Schema relaxes some aspects of the data model,
allowing comment and metadata values to be optional rather than required properties.
