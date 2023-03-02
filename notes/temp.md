# What is the problem?

The Arabic script is the second most widely used script in the world after Latin, and there are many other RTL scripts. If you try to display a string without setting the right base direction, you will get garbled text.  For example:

<img width="702" alt="Screenshot 2023-03-02 at 11 31 37" src="https://user-images.githubusercontent.com/4839211/222420395-186bb379-ccc5-4cbb-844c-de594bc7b0d2.png">

will become the very garbled:

<img width="702" alt="Screenshot 2023-03-02 at 11 31 25" src="https://user-images.githubusercontent.com/4839211/222420448-aaed7f58-087c-4b26-91ca-d48b35dd4ebf.png">

Often this can be avoided by setting a base direction the same as that of the first character in the string. However, this doesn't always work, and in those cases the string has to come with metadata that indicates the expected display direction.

If you are displaying a string of Han ideographs to a user, you'll need to know which language they speak in order to get the right font. Otherwise, Japanese users will be presented with text that reads like Chinese, and vice versa. The following shows examples of characters that appear differently depending on the language:

![ja_zh_fonts](https://user-images.githubusercontent.com/4839211/222422731-8b6f4aff-599c-4326-99f0-b09811428f65.png)

This is a problem that affects other languages, besides Japanese and Chinese.  But language metadata is also needed to support things like hyphenation, voice browser rendering, line breaking behaviour, spell checking, sorting  lists, or formatting values, and so on.

Because a lack of information about direction and language can cause problems for end users we need to find a solution for the cases that fail.  That's the aim of the work described here.
