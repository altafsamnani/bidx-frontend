<?php

/**
 * Rendering of variables into template
 * It renders the variables assigned them through load method through main app.php file
 * http://coding.smashingmagazine.com/2011/10/17/getting-started-with-php-templating/
 *
 *
 * @author Altaf Samnani
 * @version 1.0
 */
class TemplateLibrary {

  protected $template_dir = 'templates/';
  protected $vars = array();

  /**
   * Constructor.
   * Assign the templates directory
   */
  public function __construct($template_dir = null) {
    if ($template_dir !== null) {
      // Check here whether this directory really exists
      $this->template_dir = $template_dir;
    }
  }

  /**
   * Renders the file to display content
   * @param string $template_file file to display
   *
   */
  public function render($template_file) {
    if (file_exists($this->template_dir . $template_file)) {
      include $this->template_dir . $template_file;
    }
    else {
      throw new Exception('no template file ' . $template_file . ' present in directory ' . $this->template_dir);
    }
  }

  /**
   * PHP Magicmethod to assign variables
   * @param string $name name of the variable
   * @param string $value value of the variable
   *
   */
  public function __set($name, $value) {
    $this->vars[$name] = $value;
  }

  /**
   * PHP Magicmethods to get variables value
   * @param string $name name of the variable
   *
   */
  public function __get($name) {
    return $this->vars[$name];
  }

  /**
   * Add bootstrap rows through views
   * @param int $gridColumnVal length of grid
   * @param String $rowValues Row values to be displayed
   * @param String $className Row class name
   * @structure data1
   *            data2
   *            data3
   *
   * @return String $rowHtml Row html
   *
   */
  public function addMultipleRows($gridColumnVal, $rowValues, $className = NULL, $tagName = 'div') {

    $rowHtml = "<div class='row-fluid'>";
    $rowHtml .= "<div class='" . $gridColumnVal . "'>";
    $className = ($className) ? " class = '" . $className . "' " : '';

    foreach ($rowValues as $label => $values) {
      $values = $this->addExtraValuesToRows($label, $values);

      if ($values && $values != 'null') {

        //Class Name
        if (is_array($className) && isset($className[$label])) {
          $classRow = 'class ="' . $className[$label] . '"';
        }
        else {
          $classRow = ( $className ) ? 'class ="' . $className . '"' : '';
        }

        //Tag Name
        if (is_array($tagName) && isset($tagName[$label])) {
          $tagRow = $tagName[$label];
          $test = 'if';
        }
        else {
          $tagRow = $tagName;
          $test = 'else';
        }


        $rowHtml .= "<$tagRow " . $classRow . " > " . $values . " </$tagRow>";
      }
    }

    $rowHtml .= "</div>";
    $rowHtml .= "</div>";

    return $rowHtml;
  }

  public function addExtraValuesToRows($label, $values) {

    switch ($label) {

      case 'gender':
        if ($values == 'm') {
          $values = 'Male';
        }
        elseif ($values == 'f') {
          $values = 'Female';
        }
        break;

      case 'motherlanguage':
        $values = ($values) ? 'My mother language is  ' . $values : '';
        break;
      case 'language':
        $values = ($values) ? 'I Speak ' . $values : '';
        break;

      case 'nationality':
        $values = $this->getNationalityValue($values);

        break;
    }

    return $values;
  }

  public function getMultiReplacedValues($label, $values) {

    switch ($label) {

      case 'gender':
        if ($values == 'm') {
          $values = 'Male';
        }
        elseif ($values == 'f') {
          $values = 'Female';
        }

        break;

      case 'language' :
        $values = $this->getLanguagesValue($values);

        break;

      case 'country':
        $values = $this->getCountryValue($values);

        break;

      default:
    }
    return $values;
  }

  public function getNationalityValue($value) {

    $languageArr = array('en' => 'English', 'es' => 'Spanish', 'fr' => ' French', 'nl' => 'Dutch');
    $languageKey = strtolower($value);
    $returnLanguage = (isset($languageArr[$languageKey]) ? $languageArr[$languageKey] : $value);

    return $returnLanguage;
  }

  public function getLanguagesValue($value) {

    $languageArr = array('en' => 'English', 'es' => 'Spanish', 'fr' => ' French', 'nl' => 'Dutch');
    $languageKey = strtolower($value);
    $returnLanguage = (isset($languageArr[$languageKey]) ? $languageArr[$languageKey] : $value);

    return $returnLanguage;
  }

  public function getCountryValue($value) {

    $countryArr = array('en' => 'United Kingdom',
      'nl' => 'The Netherlands',
      'fr' => 'France');
    $countryKey = strtolower($value);
    $returnCountry = (isset($countryArr[$countryKey]) ? $countryArr[$countryKey] : $value);

    return $returnCountry;
  }

  /**
   * Add bootstrap rows values/labels through views
   * @param int $gridColumnVal length of spangrid
   * @param String $rowValues Row values to be displayed
   * @param String $classLabel Row class label value
   * @param String $className Row class name
   *
   * @example Email altaf@gmail.com Phone 34343
   *          addRowsWithLabelAdjacent(2,2,array('email'=>'altaf@gmail.com','Phone'=>'3434'))
   * @return String $rowHtml Row html
   *
   */
  public function addRowsWithLabelAdjacent($gridLabel, $gridValue, $rowValues, $properties = array()) {

    /** Class **/
    $classLabel = ($properties['class_label']) ? " class = '" . $properties['class_label'] . "' " : '';
    $classValue = ($properties['class_value']) ? " class = '" . $properties['class_value'] . "' " : '';
    
    /** Tag **/
    $tagLabel = ($properties['tag_label']) ? $properties['tag_label']: 'div';
    $tagValue = ($properties['tag_value']) ? $properties['tag_value']: 'div';
    
    $rowHtml = "<div class='row-fluid'>";
    foreach ($rowValues as $label => $value) {
      if ($value && $value != 'null') {
        //Display Label
        $rowHtml .= "<div class='" . $gridLabel . "'>";
        $rowHtml .= "<$tagLabel " . $classLabel . " > " . $label . " </$tagLabel>";
        $rowHtml .= "</div>";
        //Display Value
        $rowHtml .= "<div class='" . $gridValue . "'>";
        $rowHtml .= "<$tagValue " . $classValue . " > " . $value . " </$tagValue>";
        $rowHtml .= "</div>";
      }
    }
    $rowHtml .="</div>";
    return $rowHtml;
  }

  /**
   * Add bootstrap rows values/labels through views
   * @param int $gridColumnVal length of spangrid
   * @param String $rowValues Row values to be displayed
   * @param String $classLabel Row class label value
   * @param String $className Row class name
   *
   * @example Summary
   *          This is business summary
   *          addRowsWithLabelBelow(2,2,array('Summary'=>'This is business summary'))
   * @return String $rowHtml Row html
   *
   */
  public function addRowsWithLabelBelow($gridLabel, $gridValue, $rowValues, $properties = array()) {

    /** Class **/
    $classLabel = ($properties['class_label']) ? " class = '" . $properties['class_label'] . "' " : '';
    $classValue = ($properties['class_value']) ? " class = '" . $properties['class_value'] . "' " : '';

    /** Tag **/
    $tagLabel = ($properties['tag_label']) ? $properties['tag_label']: 'div';
    $tagValue = ($properties['tag_value']) ? $properties['tag_value']: 'div';


    $rowHtml = "";
    foreach ($rowValues as $label => $rowValue) {
      if ($rowValue && $rowValue != 'null') {
        //Display Label
        $rowHtml .= "<div class='row-fluid'>";
        $rowHtml .= "<div class='" . $gridLabel . "'>";
        $rowHtml .= "<$tagLabel " . $classLabel . " > " . $label . " </$tagLabel>";
        $rowHtml .= "</div>";
        $rowHtml .= "</div>";
        //Display Value
        if (is_array($rowValue)) {
          foreach ($rowValue as $value) {
            $rowHtml .= "<div class='row-fluid'>";
            $rowHtml .= "<div class='" . $gridValue . "'>";
            $rowHtml .= "<$tagValue " . $classValue . " > " . $value . " </$tagValue>";
            $rowHtml .= "</div>";
            $rowHtml .= "</div>";
          }
        }
        else {
          $rowHtml .= "<div class='row-fluid'>";
          $rowHtml .= "<div class='" . $gridValue . "'>";
          $rowHtml .= "<$tagValue " . $classValue . " > " . $rowValue . " </$tagValue>";
          $rowHtml .= "</div>";
          $rowHtml .= "</div>";
        }
      }
    }

    return $rowHtml;
  }

  /**
   * Iterate mutivalued variable and make html row
   * @param int $data Variable to iterate
   * @param String $seperator Seperator value
   * @param String $elementKey Variable to fetch
   *
   * @return String $rowHtml Row html
   *
   */
  public function getMultiValues($data, $seperator, $elementKey = NULL, $condition = NULL) {

    $sep = '';
    $htmlDisplay = '';

    //If comma and 2 values then make seperator And
    if (trim($seperator) == ',' && count($data) == 2) {
      $seperator = ' And ';
    }

    // exit;
    //Iterate variable and add seperator
    foreach ($data as $key => $dataValue) {


      if ($elementKey) {
        if ($condition) {
          foreach ($condition as $keyCondition => $valueCondition) {
            if ($dataValue->$keyCondition == $valueCondition) {
              $writeValue = true;
            }
            else {
              $writeValue = false;
            }
          }

          $objValue = ($writeValue) ? $dataValue->$elementKey : '';
        }
        else {
          $objValue = $dataValue->$elementKey;
        }
      }
      else {
        $objValue = $dataValue;
      }

      $objValue = $this->getMultiReplacedValues($elementKey, $objValue);
      if ($objValue != 'null' && $objValue) {
        $htmlDisplay .= $sep . $objValue;
        $sep = $seperator;
      }
    }

    return $htmlDisplay;
  }

  /**
   * Iterate mutivalued variable and make html row
   * @param int $data Variable to iterate
   * @param String $seperator Seperator value
   * @param String $elementKey Variable to fetch
   *
   * @return String $rowHtml Row html
   *
   */
  public function createRowValue($valueArr, $separator) {

    $html = '';
    $sep = '';

    foreach ($valueArr as $rowLabel => $rowValue) {

      if ($rowValue != 'null' && $rowValue) {
        $rowValue = $this->getMultiReplacedValues($rowLabel, $rowValue);
        $html.= $sep . $rowValue;
        $sep = $separator;
      }
    }
    return $html;
  }

}

?>