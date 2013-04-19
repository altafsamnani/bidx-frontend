<?php
/**
 * Custom functions for Bidx
 *
 *
 */

/**
 * Applies the template replacement variables from Post vars
 *
 * @since April 16
 * @Author Altaf Samnani
 *
 * @param string $content  Template Content
 * @param string $content  Replaced Template Content
 */

add_filter( 'the_content', 'bidx_filter', 20 );

function bidx_filter($content) {
  $formValues = $_POST;
  $hiddenElement = "";
  foreach ($formValues as $key => $value) {
    $varName = '[!' . strtoupper($key) . '!]';
    if (strpos($content, $varName)) {
      $content = str_replace($varName, $value, $content);
    }
    else {
      $hiddenElement .= '<input type="hidden" name="'. $key. '" value="'. $value. '">';
    }
  }
  // Add variables as hidden that cant be replaced from Post Variables to keep the previous state
  $content = str_replace('<!--HIDDEN-->', $hiddenElement, $content);

  // Debug the Get/Post params
  if (WP_DEVELOPMENT == true) {

    new dBug($_REQUEST);
  }

  return $content;
}