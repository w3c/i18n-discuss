/**
 * The data model representation of a message resource.
 *
 * This is not a CST, so does not encode whitespace or empty lines.
 * Users are encouraged to not consider them significant,
 * and to always normalize the syntax representation of a resource
 * when manipulating it programmatically.
 *
 * Similarly, all character escapes are processed in this representation
 * (for all identifiers, metadata, and for `string` entry values),
 * and users are encouraged to always normalize
 * the syntax representation of escaped characters.
 */
export interface Resource<Message> {
  /**
   * A comment on the whole resource, which applies to all of its sections and entries.
   *
   * May contain multiple lines separated by `\n` characters.
   * For each line, the `#` sigil and up to one space or tab is trimmed
   * from the start of the line, along with any trailing whitespace.
   * In the syntax, each line will be prefixed by `#` and if the line is not empty, one space.
   *
   * An empty or whitespace-only comment will be represented by an empty string.
   *
   * In the syntax, resource comments are separated from the rest of the resource
   * by a frontmatter separator line `---`.
   */
  comment: string;

  /**
   * Metadata attached to the whole resource.
   *
   * In the syntax, these are separated from the rest of the resource
   * by a frontmatter separator line `---`.
   */
  meta: Metadata[];

  /**
   * The body of a resource, consisting of an array of sections.
   *
   * A valid resource may have an empty sections array.
   */
  sections: Section<Message>[];
}

/**
 * Metadata is attached to a resource, section, or a single entry.
 */
export interface Metadata {
  /**
   * A non-empty string keyword.
   *
   * Most likely a sequence of `a-z` characters,
   * but may technically contain _any_ characters
   * which might require escaping in the syntax.
   */
  key: string;

  /**
   * The metadata contents.
   *
   * Values have all their character \escapes processed.
   * Note that the processed values of `\\`, `\{`, `\|`, and `\}`
   * are exactly the same characters sequences.
   */
  value: string;
}

export interface Section<Message> {
  /**
   * A comment on the whole section, which applies to all of its entries.
   *
   * May contain multiple lines separated by `\n` characters.
   * For each line, the `#` sigil and up to one space or tab is trimmed
   * from the start of the line, along with any trailing whitespace.
   * In the syntax, each line will be prefixed by `#` and if the line is not empty, one space.
   *
   * An empty or whitespace-only comment will be represented by an empty string.
   * */
  comment: string;

  /** Metadata attached to this section. */
  meta: Metadata[];

  /**
   * The section identifier.
   *
   * Each `string` part of the identifier MUST be a non-empty string.
   *
   * The top-level or anonymous section has an empty `id` array.
   * The resource syntax requires this array to be non-empty
   * for all sections after the first one,
   * but empty identifier arrays MAY be used
   * when this data model is used to represent other message resource formats,
   * such as Fluent FTL files.
   *
   * The entry identifiers are not normalized,
   * i.e. they do not include this identifier.
   */
  id: string[];

  /**
   * Section entries consist of message entries and comments,
   * each identified by its string `type` property.
   *
   * Empty lines are not included in the data model.
   */
  entries: (Entry<Message> | Comment)[];
}

export interface Entry<Message> {
  type: "entry";

  /**
   * A comment on this entry.
   *
   * May contain multiple lines separated by `\n` characters.
   * For each line, the `#` sigil and up to one space or tab is trimmed
   * from the start of the line, along with any trailing whitespace.
   * In the syntax, each line will be prefixed by `#` and if the line is not empty, one space.
   *
   * An empty or whitespace-only comment will be represented by an empty string.
   * */
  comment: string;

  /** Metadata attached to this entry. */
  meta: Metadata[];

  /**
   * The entry identifier.
   *
   * This MUST be a non-empty array of non-empty `string` values.
   *
   * The identifiers of entries in a section are not normalized,
   * i.e. they do not include its identifier.
   *
   * In a valid resource, each entry has a distinct normalized identifier,
   * i.e. the concatenation of its section header identifier (if any) and its own.
   */
  id: string[];

  /**
   * The value of an entry, i.e. the message.
   *
   * String values have all their character \escapes processed.
   * Note that the processed values of `\\`, `\{`, `\|`, and `\}`
   * are exactly the same characters sequences.
   */
  value: Message;
}

export interface Comment {
  type: "comment";

  /**
   * A standalone comment.
   *
   * May contain multiple lines separated by `\n` characters.
   * For each line, the `#` sigil and up to one space or tab is trimmed
   * from the start of the line, along with any trailing whitespace.
   * In the syntax, each line will be prefixed by `#` and if the line is not empty, one space.
   *
   * An empty or whitespace-only comment will be represented by an empty string.
   * */
  comment: string;
}
