This is not exhaustive scientific research, but merely to give a basic idea of some of the requirements and recommendations for non-Latin orthographies.

In https://www.w3.org/TR/WCAG22/#visual-presentation :

> Width is no more than 80 characters or glyphs (40 if CJK).

Personally, I have no opinion on this.

The [Chinese Layout Task Force](https://github.com/w3c/clreq) is also discussing this issue recently. Our current conclusion (it's still under discussion) is that the minimum line length of Chinese text should not be less than 10 characters, and the maximum line length of the text in horizontal writing mode should not be longer than 48 characters, in vertical writing mode it should not be longer than 55 characters.

I will let you know when the group has a consensus on this.

@aphillips notes:
> 80 characters seems like it might have a historical basis, such as the use of terminals or software
> that is line based. Certain kinds of screen readers, such as braille ones, might have limits like this.
> Since it isn't clear why 80 (or 40 for CJK) was chosen, more info is needed to provide guidance. (One
> reason I think of terminals and line printers is that historically "double-byte" characters took
> two screen positions on terminals, hence 80 Latin characters became 40 CJK ones)
>
> Note that this is strictly a maximum and we should be careful about what we suggest.

---

> Text is not justified (aligned to both the left and the right margins).

This does not apply to all writing systems. For example, Chinese and Japanese prefer fully justified text to left-aligned text. See the last paragraph of [clreq 3.5.1 Necessity for Line Adjustment](https://www.w3.org/TR/clreq/#necessity_for_line_adjustment) and [jlreq 3.8.1 Necessity for Line Adjustment](https://www.w3.org/TR/jlreq/#h-note-158).

> Line spacing (leading) is at least space-and-a-half within paragraphs

Some writing systems expect larger inter-line gaps than others. `@kidayasuo` mentioned that case for Japanese in https://github.com/w3c/wcag/issues/2680#issuecomment-1252083642 and `@yyyug` mentioned the case for Chinese in https://github.com/w3c/wcag/issues/2680#issuecomment-1666380598 . Moreover, for Traditional Chinese, if the Bopomofo annotation mark is taller than the base character, the line spacing may need to be increased further.

Moreover, the complexity of characters in some Brahmic scripts may affect line height settings too. See [Tamil](https://www.w3.org/International/ilreq/tamil/#baselines) and [Thai](https://www.w3.org/International/sealreq/thai/#baselines) for examples.

> paragraph spacing is at least 1.5 times larger than the line spacing.

Some writing systems prefer to indent the first line of a paragraph, rather than leave vertical gaps between paragraphs, like [Chinese](https://www.w3.org/TR/clreq/#first_line_indents) and [Japanese](https://www.w3.org/TR/jlreq/#line_head_indent_at_the_beginning_of_paragraphs).

We should change the guideline to something like this:

> paragraph spacing is at least 1.5 times larger than the line spacing. For languages or writing systems which don't use paragraph spacing, similar mechanisms like first-line indent should be used to make sure the user recognizes the beginning of a new paragraph.

@aphillips notes:
> I made a suggested edit to the above, mostly to address the grammatical needs of the sentence starting "For languages..."
> I am not sure about this recommendation in part because I don't know what the space is supposed to do and whether
> the recommendation might apply to other writing systems which might normally set paragraphs solid.

-----

In https://www.w3.org/TR/WCAG22/#text-spacing :

> Spacing following paragraphs to at least 2 times the font size;

See my comment on paragraph spacing above.

> Letter spacing (tracking) to at least 0.12 times the font size;

This does not apply to all writing systems. For example, in [Chinese](https://www.w3.org/TR/clreq/#principles_of_arrangement_of_han_characters) and [Japanese](https://www.w3.org/TR/jlreq/#basic_principles_for_development_of_this_document), no extra space appears between their character frames, although `@murata2makoto` mentioned some exceptions in https://github.com/w3c/wcag/issues/2680#issuecomment-1253150807

Letter spacing in scripts like Arabic is also different from the Latin script, because this might result in the text being stretched.

> Word spacing to at least 0.16 times the font size.

Not all writing systems have word spacing. Writing systems like Balinese, Batak, Tai Le, Khmer, Lao, Burmese, Thai, Tibetan, Javanese and Chinese/Japanese don't have word spacing. Some of these writing systems use space as a phrase separator, some of them only have syllable separators, and some don't use any space character at all.

Also, in Samaritan and sometimes in Amharic, words are separated by special punctuation instead of a space character.

> Exception: Human languages and scripts that do not make use of one or more of these text style properties in written text can conform using only the properties that exist for that combination of language and script.

First, section 1.4.8 doesn't have a similar exception, and we should add one.

Ideally, we should develop guidelines for languages and scripts around the world. But before we develop guidelines for non-Latin orthographies, the exception needs to be more clearly worded. It can be revised to say that it only applies to languages using the Latin script, and possibly other similar scripts like Greek and Cyrillic.

Also, there is no mention of mixed text composition. There are also many cases of multilingual mixed composition. It is necessary to consider the impact on the overall readability and legibility to make a judgment.

For example, [Chinese](https://www.w3.org/TR/clreq/#chinese_and_western_mixed_text_composition)/[Japanese](https://www.w3.org/TR/jlreq/#japanese_and_western_mixed_text_composition) and Latin mixed text composition is pretty common, and I have also seen mixed text composition of Chinese and other scripts such as Arabic, Tai Le, and so on.

We could probably revise it to a note like this:

> Note: This success criterion only applies to human languages using the Latin script. The working group intends to fix this in a future version.

> Human languages and scripts that do not use one or more of these text style properties in written text can conform using only the properties that exist for that combination of language and script.

> If the text contains multiple human languages, the author should adjust the text style properties in written text based on the overall readability and legibility of the text.

> When WCAG is translated into another language, care must be taken to adjust the guideline to match the requirements of that combination of language, script, and region.

@aphillips notes:
> I am not sure about the "translated into another language" suggestion because the translation should be a direct translation, rather than attempting to codify
> the needs of a specific language or writing system. The intention of the WCAG group should be preserved. If this recommendation really means "When creating
> WCAG standards for another language...", then we should say that.
>
> I would suggestion some other phrasing changes. Specifically:
>> Note: These success criteria only apply to human languages written in the Latin script.
>> Human languages and writing systems do not always use one or more of these text style
>> properties.
>> In such cases, the text is conformant as long as it applies properties appropriate for
>> that language and/or writing system.
>
> The thorny problem I see here is that concepts such as justification, letter-spacing, tracking, leading, paragraph spacing, and the like
> *do* have meaning ("make use" of these typographical features), even in languages where it would negatively impact the text to adopt
> these guidelines.
> That is, the above text says to apply paragraph spacing or leading requirements to (for example) Chinese text because
> those concepts "exist for that combination of language and script" (by contrast, word-spacing wouldn't apply).
> A site claiming to conform to WCAG2.2 would look odd to Chinese users under those circumstances.
