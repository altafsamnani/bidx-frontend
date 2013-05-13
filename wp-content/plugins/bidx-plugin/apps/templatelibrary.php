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
   * @param int $gridColumnVal length of spangrid
   * @param String $rowValues Row values to be displayed
   * @param String $className Row class name
   *
   * @return String $rowHtml Row html
   *
   */
  public function addRows($gridColumnVal, $rowValues, $className = "") {

    $rowHtml = "<div class='span" . $gridColumnVal . "'>";
    $className = ($className) ? " class = '" . $className . "' " : '';

    foreach ($rowValues as $values) {
      if ($values) {
        $rowHtml .= "<div " . $className . " > " . $values . " </div>";
      }
    }

    $rowHtml .= "</div>";

    return $rowHtml;
  }

  /**
   * Add bootstrap rows values/labels through views
   * @param int $gridColumnVal length of spangrid
   * @param String $rowValues Row values to be displayed
   * @param String $classLabel Row class label value
   * @param String $className Row class name
   *
   * @return String $rowHtml Row html
   *
   */
  public function addRowsWithLabel($gridLabel, $gridValue, $rowValues, $classLabel = "", $classValue = "") {

    $rowHtml = "";
    $classLabel = ($classLabel) ? " class = '" . $classLabel . "' " : '';
    $classValue = ($classValue) ? " class = '" . $classValue . "' " : '';

    foreach ($rowValues as $label => $value) {
      if ($value) {
        //Display Label
        $rowHtml .= "<div class='span" . $gridLabel . "'>";
        $rowHtml .= "<div " . $classLabel . " > " . $label . " </div>";
        $rowHtml .= "</div>";
        //Display Value
        $rowHtml .= "<div class='span" . $gridValue . "'>";
        $rowHtml .= "<div " . $classValue . " > " . $value . " </div>";
        $rowHtml .= "</div>";
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
  public function getMultiValues($data, $seperator, $elementKey = NULL) {

    $sep = '';
    $htmlDisplay = '';

    //If comma and 2 values then make seperator And
    if (trim($seperator) == ',' && count($data) == 2) {
      $seperator = ' and ';
    }
    
    //Iterate variable and add seperator
    foreach ($data as $key => $value) {

      $objValue = ($elementKey) ? $value->$elementKey : $value;
      $htmlDisplay .= $sep . $objValue;

      $sep = $seperator;
    }

    return $htmlDisplay;
  }

}

?>