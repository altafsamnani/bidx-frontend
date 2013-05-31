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
   * Show the property when available
   * @param array structure $object
   * @param string $property name of the property
   */
  public function showProperty($object, $property) {
  	if ( property_exists($object, $property ) ) { 
  		echo $object -> $property; 
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
  public function addAdjacentRows($gridColumnVal, $rowValues, $className = NULL, $tagName = 'div') {

    $rowHtml = "<div class='row-fluid'>";


    foreach ($rowValues as $label => $values) {

      $values = $this->addExtraValuesToRows($label, $values);
      $classRow = NULL;
      if ($values && $values != 'null') {
        $rowHtml .= "<div class='" . $gridColumnVal . "'>";
        //Class Name
        if (is_array($className) && isset($className[$label])) {

          $classRow = 'class ="' . $className[$label] . '"';
        }
        else {
          $classRow = (!is_array($className) && $className ) ? 'class ="' . $className . '"' : '';
        }

        //Tag Name
        if (is_array($tagName) && isset($tagName[$label])) {
          $tagRow = $tagName[$label];
        }
        else {
          $tagRow = $tagName;
        }


        $rowHtml .= "<$tagRow " . $classRow . " > " . $values . " </$tagRow>";
        $rowHtml .= "</div>";
      }
    }


    $rowHtml .= "</div>";

    return $rowHtml;
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
        }
        else {
          $tagRow = $tagName;
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

    $languageArr = array('en' => 'English', 'es' => 'Spanish', 'fr' => ' French', 'nl' => 'Dutch', 'uk' => 'English(UK)');
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

    /** Class * */
    $classLabel = ($properties['class_label']) ? " class = '" . $properties['class_label'] . "' " : '';
    $classValue = ($properties['class_value']) ? " class = '" . $properties['class_value'] . "' " : '';

    /** Tag * */
    $tagLabel = ($properties['tag_label']) ? $properties['tag_label'] : 'div';
    $tagValue = ($properties['tag_value']) ? $properties['tag_value'] : 'div';

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

    /** Class * */
    $classLabel = ($properties['class_label']) ? " class = '" . $properties['class_label'] . "' " : '';
    $classValue = ($properties['class_value']) ? " class = '" . $properties['class_value'] . "' " : '';

    /** Tag * */
    $tagLabel = ($properties['tag_label']) ? $properties['tag_label'] : 'div';
    $tagValue = ($properties['tag_value']) ? $properties['tag_value'] : 'div';


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
  public function addTableRows($header, $rowsArr, $class) {

    $html = NULL;
    if (isset($rowsArr)) {

      $htmlHeader.= "<table class = '$class' > ";
      //Build Header
      $htmlHeader.= "<tr>";
      foreach ($header as $headerKey => $headerValue) {
        $htmlHeader.= "<th>" . $headerKey . "</th>";
      }
      $htmlHeader.= "</tr>";
      foreach ($rowsArr as $rowValue) {
        $html.= "<tr>";
        foreach ($header as $headerKey => $headerValue) {
          if ($rowValue->$headerValue) {
            $html.= "<td>" . $rowValue->$headerValue . "</td>";
            $display = true;
          }
        }
        $html.= "</tr>";
      }

      $htmlFooter.="</table>";

      if ($display) {

        $returnHtml = $htmlHeader . $html . $htmlFooter;
      }

      return $returnHtml;
    }
  }

  /**
   * Get attachment to display
   * @param int $gridColumnVal length of spangrid
   * @param String $rowValues Row values to be displayed
   * @param String $classLabel Row class label value
   * @param String $className Row class name
   *
   * 
   * @return String $rowHtml Row html
   *
   */
  public function getAttachmentsDisplay($gridLabel, $gridValue, $rowValues, $properties = array()) {
    $rowHtml = "";

    if ($rowValues) {
      /** Class * */
      $classLabel = ($properties['class_label']) ? " class = '" . $properties['class_label'] . "' " : '';
      $classValue = ($properties['class_value']) ? " class = '" . $properties['class_value'] . "' " : '';


      foreach ($rowValues as $label => $rowValue) {
        if ($rowValue && $rowValue != 'null') {
          //Display Label
          $rowHtml .= "<div class='row-fluid'>";
          $rowHtml .= "<div class='" . $gridLabel . "'>";
          $rowHtml .= "<h5 " . $classLabel . " > " . $label . " </h5>";
          $rowHtml .= "</div>";
          $rowHtml .= "</div>";
          //Display Value
          if (is_array($rowValue)) {
            foreach ($rowValue as $value) {
              $rowHtml .= "<div class='row-fluid'>";
              $rowHtml .= "<div class='" . $gridValue . "'>";
              $rowHtml .= "<a href= '" . $value->document . "' " . $classValue . " > " . $value->documentName . " </a>";
              $rowHtml .= "</div>";
              $rowHtml .= "</div>";
            }
          }
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

  /**
   * Add Social Plugin script
   *
   * @param String $type Social Plugin Type
   * @param String $username Userid of social site
   *
   * @return String $icon script Row html
   *
   */
  public function addSocialPluginScript($type, $username) {

    $scriptContent = NULL;
    if ($username) {
      switch ($type) {

        case 'facebook' :
          $scriptContent = '<iframe src="//www.facebook.com/plugins/follow.php?href=https%3A%2F%2Fwww.facebook.com%2F' . $username . '&amp;layout=button_count&amp;show_faces=true&amp;colorscheme=light&amp;font=verdana&amp;width=450&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:450px; height:21px;" allowTransparency="true"></iframe>';
          break;
        case 'twitter' :
          $scriptContent = '<iframe allowtransparency="true" frameborder="0" scrolling="no"
                            src="//platform.twitter.com/widgets/follow_button.html?screen_name=twitterapi"
                            style="width:300px; height:20px;"></iframe>';
          break;
        case 'linkedin':
          $scriptContent = '<script src="//platform.linkedin.com/in.js" type="text/javascript"></script>
<script type="IN/MemberProfile" data-id="' . $username . '" data-format="click" data-related="true"></script>';
          break;

        case 'skype' :
          $scriptContent = '<script type="text/javascript" src="//cdn.dev.skype.com/uri/skype-uri.js"></script>
                              <div id="SkypeButton_Chat_' . $username . '_1">
                                <script type="text/javascript">
                                  Skype.ui({
                                    "name": "chat",
                                    "element": "SkypeButton_Chat_' . $username . '_1",
                                    "participants": ["' . $username . '"]
                                  });
                                </script>
                              </div>';
          break;

        case 'facebookprofile' :

          //$fbUrl = (preg_match("/facebook/i", $username)) ? $username : 'https://www.facebook.com/' . $username;

         // $fbUrl = (preg_match("/http/i", $fbUrl)) ? $fbUrl : 'https://' . $fbUrl;
          $fbUrl = 'https://' . $username;


          $scriptContent = '<a title="View my Facebook Profile" target="_blank" class="bid-social facebook" href="' . $fbUrl . '">Facebook</a>';
          break;
        
        case 'twitterprofile' :
          $twitterUserName = str_replace("#", "", $username);
          $twitterUrl = 'https://twitter.com/' . $twitterUserName;
          $scriptContent = '<a title="View my Twitter Profile" target="_blank" class="bid-social twitter" href="' . $twitterUrl . '">Twitter</a>';
          break;
      }
    }
    return $scriptContent;
  }
  
  /**
   * Validation function for nested objects
   * @param unknown $variable the object
   * @param unknown $checkArray array of nested fields
   * @param number $i do not use, for recursive use
   * @return boolean true if is set
   */
  function recursive_isset($variable, $checkArray, $i=0) {
  	
  	$new_var = null;
  	if(is_array($variable) && array_key_exists($checkArray[$i], $variable)) {
  		$new_var = $variable[$checkArray[$i]];
  	}
  	else if(is_object($variable) && array_key_exists($checkArray[$i], $variable)) {
  		$new_var = $variable->$checkArray[$i];
  	}
  	if(!isset($new_var)) {
  		return false;
  	}
  	else if(count($checkArray) > $i + 1) {
  		return $this -> recursive_isset($new_var, $checkArray, $i+1);
  	}
  	else {
  		return $new_var;
  	}
  	
  }

}

?>