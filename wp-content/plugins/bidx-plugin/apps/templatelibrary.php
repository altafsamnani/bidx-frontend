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
class TemplateLibrary
{

    protected $template_dir = 'templates/';
    protected $vars = array ();

    /**
     * Constructor.
     * Assign the templates directory
     */
    public function __construct ($template_dir = null)
    {
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
    public function showProperty ($object, $property)
    {
        if (property_exists ($object, $property)) {
            echo $object->$property;
        }
    }

    /**
     * Renders the file to display content
     * @param string $template_file file to display
     *
     */
    public function render ($template_file, $echo = true)
    {

        if (file_exists ($this->template_dir . $template_file))
        {
            if ( !$echo )
            {
                ob_start(); // turn on output buffering
            }
            include $this->template_dir . $template_file;
            if ( !$echo )
            {
                $result = ob_get_contents(); // get the contents of the output buffer
                ob_end_clean(); //  clean (erase) the output buffer and turn off output buffering
                return $result;
            }
        }
        else {
            throw new Exception ('no template file ' . $template_file . ' present in directory ' . $this->template_dir);
        }

    }

    /**
     * PHP Magicmethod to assign variables
     * @param string $name name of the variable
     * @param string $value value of the variable
     *
     */
    public function __set ($name, $value)
    {
        $this->vars[$name] = $value;
    }

    /**
     * PHP Magicmethods to get variables value
     * @param string $name name of the variable
     *
     */
    public function __get ($name)
    {
         return (isset( $this->vars[$name] ) ) ? $this->vars[$name] : NULL;
    }

    /**
     * PHP Magic method for checking if isset
     */
    public function __isset ($key)
    {
        return key_exists ($key, $this->vars);
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
    public function addAdjacentRows ($gridColumnVal, $rowValues, $className = NULL, $tagName = 'div')
    {
        $rowHtml = "";

        foreach ($rowValues as $label => $values) {

            $values = $this->addExtraValuesToRows ($label, $values);
            $classRow = NULL;
            if ($values && $values != 'null') {
                $rowHtml .= "<div class='" . $gridColumnVal . "'>";
                //Class Name
                if (is_array ($className) && isset ($className[$label])) {

                    $classRow = 'class ="' . $className[$label] . '"';
                } else {
                    $classRow = (!is_array ($className) && $className ) ? 'class ="' . $className . '"' : '';
                }

                //Tag Name
                if (is_array ($tagName) && isset ($tagName[$label])) {
                    $tagRow = $tagName[$label];
                } else {
                    $tagRow = $tagName;
                }

                $rowHtml .= "<$tagRow " . $classRow . " > " . $values . " </$tagRow>";
                $rowHtml .= "</div>";
            }
        }

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
    public function addMultipleRows ($gridColumnVal, $rowValues, $className = NULL, $tagName = 'div')
    {
        $rowHtml = "";
        if ( $gridColumnVal === 'col-sm-12' ) {
            $rowHtml = "<div class='row'>";
        }
        $rowHtml .= "<div class='" . $gridColumnVal . "'>";
        $className = ($className) ? " class = '" . $className . "' " : '';

        foreach ($rowValues as $label => $values) {
            $values = $this->addExtraValuesToRows ($label, $values);

            if ($values && $values != 'null') {

                //Class Name
                if (is_array ($className) && isset ($className[$label])) {
                    $classRow = 'class ="' . $className[$label] . '"';
                } else {
                    $classRow = ( $className ) ? 'class ="' . $className . '"' : '';
                }

                //Tag Name
                if (is_array ($tagName) && isset ($tagName[$label])) {
                    $tagRow = $tagName[$label];
                } else {
                    $tagRow = $tagName;
                }


                $rowHtml .= "<$tagRow " . $classRow . " > " . $values . " </$tagRow>";
            }
        }

        $rowHtml .= "</div>";

        if ( $gridColumnVal === 'col-sm-12' ) {
            $rowHtml .= "</div>";
        }

        return $rowHtml;
    }

    public function getStaticVal ($type, $key)
    {
        $staticData = BidxCommon::$i18nData['static'];

        $returnVal = $key;
        if (isset ($staticData[$type])) {
            foreach ($staticData[$type] as $staticVal) {
                if ($staticVal->value == $key) {
                    $returnVal = $this->escapeHtml ($staticVal->label);
                    break;
                }
            }
        }

        return $returnVal;
    }

    public function addExtraValuesToRows ($label, $values)
    {
        switch ($label) {

            case 'gender':
                $values = $this->getStaticVal ('gender', $values);
                break;

            case 'motherlanguage':
                $values = ($values) ? __('My mother language is  ','bidxplugin') . $this->getStaticVal ('language', $values) : '';
                break;

            case 'language':
                $values = ($values) ? __('I speak ','bidxplugin') . $this->getStaticVal ('language', $values) : '';
                break;

            case 'nationality':
                $values = $this->getStaticVal ('nationality', $values);
                break;

            case 'highestEducation':
                $values = $this->getStaticVal ('education', $values);
                break;

            case 'investorType':
                $values = $this->getStaticVal ('investorType', $values);
                break;

            case 'legalForm':
                $values = $this->getStaticVal ('legalForm', $values);
                break;

            case 'investmentType':
                $values = $this->getStaticVal ('investmentType', $values);
                break;

            case 'typicalInvolvement':
                $values = $this->getStaticVal ('typicalInvolvement', $values);
                break;
        }

        return $values;
    }

    /*
     *
     * Array
      (
      [0] => investorType
      [1] => renderType
      [2] => consumerType
      [3] => documentType
      [4] => locale
      [5] => exportImport
      [6] => investmentType
      [7] => permitsLicencesObtained
      [8] => stageBusiness
      [9] => education
      [10] => legalForm
      [11] => businessOutcome
      [12] => country
      [13] => focusRole
      [14] => socialImpact
      [15] => envImpact
      [16] => prefNotMethod
      [17] => gender
      [18] => language
      [19] => languageRating
      [20] => industry
      )
     *
     */

    public function getMultiReplacedValues ($label, $values)
    {

        switch ($label) {
            case 'investorType':
            case 'renderType':
            case 'consumerType':
            case 'documentType':
            case 'locale':
            case 'exportImport':
            case 'investmentType':
            case 'permitsLicencesObtained':
            case 'stageBusiness':
            case 'education':
            case 'legalForm':
            case 'businessOutcome':
            case 'country':
            case 'focusRole':
            case 'socialImpact':
            case 'envImpact' :
            case 'prefNotMethod':
            case 'gender':
            case 'language':
            case 'languageRating':
            case 'industry':
            case 'industrySector':
            case 'mentorExpertise':
            case 'productService':
            case 'reasonForSubmission':
            case 'typicalInvolvement':
                $values = $this->getStaticVal ($label, $values);

                break;
        }
        return $values;
    }

    /**
     * Create pairs of labels / values in a bootstrap row
     * @param Array $pairs
     * @param Array $properties Label's Tag and Value's Tag
     *
     * @return String $pairRow Row html
     *
     */
    public function pairRows ( $pairs, $properties = array ( 'tag_label' => 'label', 'tag_value' => 'div' ) )
    {
        /** Tags * */
        $tagLabel = $properties['tag_label'];
        $tagValue = $properties['tag_value'];

        foreach ($pairs as $label => $value) {
            if ( $value != NULL ){
                $items[$label]=$value;
            }
        }

        if ( !$items )
        {
            return;
        }

        $pairs = array_chunk($items, 2, true);
        $pairRow = '';
        foreach ($pairs as $pair) {
            $pairRow .= "<div class='row'>";
            foreach ($pair as $label => $col) {
                if ($col && $col != 'null') {
                    if ( is_array( $col ) ) {
                        $col = implode(', ', $col);
                    }
                    $pairRow .= "<div class='col-sm-6'>";
                    $pairRow .= "<$tagLabel>" . $label . " </$tagLabel>";
                    $pairRow .= "<$tagValue>" . html_entity_decode( $col ) . " </$tagValue>";
                    $pairRow .= "</div>";
                }
            }
            $pairRow .= "</div>";
        }
        return $pairRow;
    }


    /**
     * Create pairs of labels / values inline
     * @param Array $pairs
     * @param Array $properties Label's Tag and Value's Tag
     *
     * @return String $inlineRow Row html
     *
     */
    public function inlineRow ( $rowValues, $properties = array () )
    {
        /** Class * */
        $classLabel = (isset ($properties['class_label']) && $properties['class_label']) ? " class = '" . $properties['class_label'] . "' " : '';
        $classValue = (isset ($properties['class_value']) && $properties['class_value']) ? " class = '" . $properties['class_value'] . "' " : '';

        /** Tag * */
        $tagLabel = (isset ($properties['tag_label']) && $properties['tag_label']) ? $properties['tag_label'] : 'strong';
        $tagValue = (isset ($properties['tag_value']) && $properties['tag_value']) ? $properties['tag_value'] : 'span';

        $rowHtml = '';
        foreach ($rowValues as $label => $value) {
        $rowHtml .= "<div>";
            if ($value && $value != 'null') {
                //Display Label
                $rowHtml .= "<$tagLabel " . $classLabel . " > " . $label . " </$tagLabel>";
                //Display Value
                $rowHtml .= "<$tagValue " . $classValue . " > " . $value . " </$tagValue>";
            }
        $rowHtml .="</div>";
        }
        return $rowHtml;
    }


    /**
     * Create pairs of labels / values in a table
     * @param Array $pairs
     * @param Array $properties Label's Tag and Value's Tag
     *
     * @return String $tableRow Row html
     *
     */
    public function tableRow ( $rowValues, $properties = array () )
    {
        /** Class * */
        $classLabel = (isset ($properties['class_label']) && $properties['class_label']) ? " class = '" . $properties['class_label'] . "' " : '';
        $classValue = (isset ($properties['class_value']) && $properties['class_value']) ? " class = '" . $properties['class_value'] . "' " : '';

        /** Tag * */
        $tagLabel = (isset ($properties['tag_label']) && $properties['tag_label']) ? $properties['tag_label'] : 'td';
        $tagValue = (isset ($properties['tag_value']) && $properties['tag_value']) ? $properties['tag_value'] : 'td';

        $rowHtml = '<table class="table table-condensed table-bottom-border"><tbody>';
        foreach ($rowValues as $label => $value)
        {
            if ( is_array( $value ) )
            {
                $value = $value[0];
            }

            if ($value && $value != 'null')
            {
                $rowHtml .= "<tr>";
                    //Display Label
                    $rowHtml .= "<$tagLabel " . $classLabel . " > " . $label . " </$tagLabel>";
                    //Display Value
                    $rowHtml .= "<$tagValue " . $classValue . " > " . $value . " </$tagValue>";
                $rowHtml .="</tr>";
            }
        }
        $rowHtml .="</tbody></table>";
        return $rowHtml;
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
    public function addRowsWithLabelAdjacent ($gridLabel, $gridValue, $rowValues, $properties = array ())
    {

        /** Class * */
        $classLabel = (isset ($properties['class_label']) && $properties['class_label']) ? " class = '" . $properties['class_label'] . "' " : '';
        $classValue = (isset ($properties['class_value']) && $properties['class_value']) ? " class = '" . $properties['class_value'] . "' " : '';

        /** Tag * */
        $tagLabel = (isset ($properties['tag_label']) && $properties['tag_label']) ? $properties['tag_label'] : 'div';
        $tagValue = (isset ($properties['tag_value']) && $properties['tag_value']) ? $properties['tag_value'] : 'div';

        $rowHtml = '';
        foreach ($rowValues as $label => $value) {
        $rowHtml .= "<div class='row'>";
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
        $rowHtml .="</div>";
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
    public function addRowsWithLabelBelow ($gridLabel, $gridValue, $rowValues, $properties = array ())
    {
        /** Class placed on the outer rows, defaults to the row from bootstrap * */
        $classRow = (isset ($properties['class_row']) ? $properties['class_row'] : 'row');

        /** Class * */
        $classLabel = (isset ($properties['class_label']) && $properties['class_label']) ? " class = '" . $properties['class_label'] . "' " : '';
        $classValue = (isset ($properties['class_value']) && $properties['class_value']) ? " class = '" . $properties['class_value'] . "' " : '';

        /** ID * */
        $idLabel = (isset ($properties['id_label']) && $properties['id_label']) ? " class = '" . $properties['id_label'] . "' " : '';
        $idValue = (isset ($properties['id_value']) && $properties['id_value']) ? " class = '" . $properties['id_value'] . "' " : '';
        /** Tag * */
        $tagLabel = (isset ($properties['tag_label']) && $properties['tag_label']) ? $properties['tag_label'] : 'div';
        $tagValue = (isset ($properties['tag_value']) && $properties['tag_value']) ? $properties['tag_value'] : 'div';


        $rowHtml = "";
        foreach ($rowValues as $label => $rowValue) {
            if ($rowValue && $rowValue != 'null') {
                //Display Label
                $rowHtml .= $classRow ? "<div class='" . $classRow . "'>" : "";
                $rowHtml .= $gridLabel ? "<div class='" . $gridLabel . "'>" : "";

                $rowHtml .= "<$tagLabel " . $classLabel . $idLabel . "  > " . $label . " </$tagLabel>";
                $rowHtml .= $gridLabel ? "</div>" : "";
                $rowHtml .= $classRow ? "</div>" : "";
                //Display Value
                if (is_array ($rowValue)) {
                    foreach ($rowValue as $value) {
                        $rowHtml .= $classRow ? "<div class='" . $classRow . "'>" : "";
                        $rowHtml .= $gridLabel ? "<div class='" . $gridValue . "'>" : "";
                        $rowHtml .= "<$tagValue " . $classValue . $idValue . "  > " . $value . " </$tagValue>";
                        $rowHtml .= $gridLabel ? "</div>" : "";
                        $rowHtml .= $classRow ? "</div>" : "";
                    }
                } else {
                    $rowHtml .= $classRow ? "<div class='" . $classRow . "'>" : "";
                    $rowHtml .= $gridLabel ? "<div class='" . $gridValue . "'>" : "";
                    $rowHtml .= "<$tagValue " . $classValue . " > " . $rowValue . " </$tagValue>";
                    $rowHtml .= $gridLabel ? "</div>" : "";
                    $rowHtml .= $classRow ? "</div>" : "";
                }
            }
        }

        return $rowHtml;
    }

    /**
     * Add bootstrap rows values/labels through views
     * @param int $gridColumnVal length of spangrid
     * @param String $header Table header needs to be displayed
     * @param String $rowsArr Row class label value
     * @param String $class Row class name
     * @param String $merge  Merge values for Column ex Name header first_name/last_name
     *
     *
     * @return String $rowHtml Row html
     *
     */
    public function addTableRows ($header, $rowsArr, $class, $merge = NULL, $cellClasses = array(), $staticArray = array()  )
    {
        $returnHtml = NULL;
        $display    = false;
        $entityType = NULL;

        if ( isset( $rowsArr ) )
        {
            $html = NULL;
            $htmlHeader = "<table class = '$class' > ";
            //Build Header
            $htmlHeader.= "<tr>";
            foreach ( $header as $headerKey => $headerValue )
            {
                $cellClass = isset( $cellClasses[ $headerValue ] ) ? $cellClasses[ $headerValue ] : '';
                $htmlHeader .= sprintf( '<th class="%s">', $cellClass );
                $htmlHeader .= $this->escapeHtml ($headerKey) . "</th>";
            }
            $htmlHeader.= "</tr>";
            foreach ($rowsArr as $rowValue)
            {
                $html.= "<tr>";

                foreach ($header as $headerKey => $headerValue)
                {
                    $cellClass = isset( $cellClasses[ $headerValue ] ) ?  $cellClasses[ $headerValue ] : '';
                    $html .= sprintf( '<td class="%s">', $cellClass );

                    if ( isset ( $merge[$headerValue] ) )
                    {
                        // If two values needs to be merged ex for Name header first_name/last_name
                        //
                        $sepMerge = "";
                        foreach ( $merge[$headerValue] as $mergeKey => $mergeVal )
                        {
                            $html.= $sepMerge . $this->escapeHtml( $rowValue->$mergeVal );
                            $sepMerge = " ";
                        }

                        $display = true;
                    }
                    elseif ( isset ( $rowValue->$headerValue ) )
                    {
                        $entityType = (!empty( $rowValue->$headerValue->bidxMeta->bidxEntityType ) ) ? $rowValue->$headerValue->bidxMeta->bidxEntityType: NULL;

                        // If the value is a document, insert an image tag
                        //
                        if ( !empty( $entityType ) && $entityType == 'bidxDocument' )
                        {
                            $document = $rowValue->$headerValue;

                            if ( preg_match ("/^image/i", $document->mimeType) )
                            {
                                $documentImage = $document->document;
                                $html .= sprintf( '<div class="img-cropper pull-left"><img src="%s" /></div>', $document->document, $documentImage );
                            }
                            else
                            {
                                $html .= '<div class="icons-rounded pull-left"><i class="fa fa-file-text-o text-primary-light"></i></div>';
                            }

                        }
                        elseif ( !empty( $entityType ) && $entityType == 'bidxAddress' )
                        {
                            $rowOutput = $rowValue->$headerValue;
                            $arr = array();

                            if ( !empty( $rowOutput->street ) )
                            {
                                array_push($arr, $rowOutput->street);
                            }

                            if ( !empty( $rowOutput->streetNumber ) )
                            {
                                array_push($arr, $rowOutput->streetNumber);
                            }

                            if ( !empty( $rowOutput->postalCode ) )
                            {
                                array_push($arr, $rowOutput->postalCode);
                            }

                            if ( !empty( $rowOutput->cityTown ) )
                            {
                                array_push($arr, $rowOutput->cityTown);
                            }

                            if ( !empty( $rowOutput->neighborhood ) )
                            {
                                array_push($arr, $rowOutput->neighborhood);
                            }

                            $html .= implode( ", ", $arr );
                        }
                        else
                        {

                            $rowOutput = $rowValue->$headerValue;
                            if ( in_array( $headerValue, $staticArray ) ) {
                                $rowOutput = $this->getStaticVal( $headerValue, $rowValue->$headerValue );
                            }

                            $html.= $this->escapeHtml ( $rowOutput );
                        }

                        $display = true;
                    }

                    $html.= "</td>";
                }

                $html.= "</tr>";

            }

            $htmlFooter = "</table>";

            if ( $display )
            {
                $returnHtml = $htmlHeader . $html . $htmlFooter;
            }
        }

        return $returnHtml;
    }

    public function displayDocuments( $docs, $label = NULL )
    {
        $html = '<div class="row"><div class="col-sm-12">';
        if ( $label )
        {
            $html .= '<h4>' . $label . '</h4>';
        }
        $html .= '<table class="table table-bordered"> <tbody>';
        $html .= '<tr>';
        $html .= '<th>' . __('Name', 'bidxplugin') . '</th>';
        $html .= '<th class="hidden-sm hidden-xs">' . __('Purpose', 'bidxplugin') . '</th>';
        $html .= '<th class="hidden-sm hidden-xs">' . __('Type', 'bidxplugin') . '</th>';
        $html .= '</tr>';
        foreach ($docs as $doc) {
            if ( isset( $doc->bidxMeta->bidxUploadId ) )
            {
                $purpose = $doc->purpose ? $doc->purpose : '-';
                $html .= '<tr>';
                $html .= '<td><a class="word-break" href="'.$doc->document.'">'. $doc->documentName .'</a></td>';
                $html .= '<td class="hidden-sm hidden-xs">'. $purpose .'</td>';
                $html .= '<td class="hidden-sm hidden-xs">'. $this->getMultiReplacedValues( 'documentType', $doc->documentType ) .'</td>';
                $html .= '</tr>';
            }
        }
        $html .= '</tbody></table>';
        $html .= '</div></div>';

        return $html;
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
    public function getAttachmentsDisplay ($gridLabel, $gridValue, $rowValues, $properties = array ())
    {
        $rowHtml = "";

        if ($rowValues) {
            /** Class * */
            $classLabel = (isset ($properties['class_label']) && $properties['class_label']) ? " class = '" . $properties['class_label'] . "' " : '';
            $classValue = (isset ($properties['class_value']) && $properties['class_value']) ? " class = '" . $properties['class_value'] . "' " : '';

            foreach ($rowValues as $label => $rowValue) {
                if ($rowValue && $rowValue != 'null') {
                    //Display Label
                    $rowHtml .= "<div class='row'>";
                    $rowHtml .= "<div class='" . $gridLabel . "'>";
                    $rowHtml .= "<h4 " . $classLabel . " > " . $this->escapeHtml ($label) . " </h4>";
                    $rowHtml .= "</div>";
                    $rowHtml .= "</div>";
                    //Display Value
                    if (is_array ($rowValue)) {
                        foreach ($rowValue as $value) {
                            if ($this->exst ($value->document)) {
                                $rowHtml .= "<div class='row'>";
                                $rowHtml .= "<div class='" . $gridValue . "'>";
                                $rowHtml .= "<a href= '" . $value->document . "' " . $classValue . " > " . $this->exst ($value->documentName) . " </a>";
                                $rowHtml .= "</div>";
                                $rowHtml .= "</div>";
                            }
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
     * @param String $elementKey Variable to Replace lookinto for multivalue ex Country, Language
     * @param String $subVal Variable to fetch ex [0] =>
     *                                                [location] = gb,
     *                                                [2] =>
     *                                                [location] = en so give location
     *
     * @return String $rowHtml Row html
     *
     */
    public function getMultiValues ($data, $seperator, $elementKey = NULL, $subVal = NULL, $condition = NULL)
    {

        $sep = '';
        $htmlDisplay = '';
        $countData = count ($data);
        $count = 1;

        $seperatorAnd = $seperator;
        //If comma and 2 values then make seperator And
        if (trim ($seperator) == ',') {
            $seperatorAnd = ' and ';
        }

        // exit;
        //Iterate variable and add seperator
        if (!empty ($data)) {
            foreach ($data as $key => $dataValue) {


                if ($subVal) {
                    if ($condition) {
                        foreach ($condition as $keyCondition => $valueCondition) {
                            if ((!empty ($dataValue->$keyCondition)) && $dataValue->$keyCondition == $valueCondition) {
                                $writeValue = true;
                            } else {
                                $writeValue = false;
                            }
                        }

                        $objValue = ($writeValue) ? $dataValue->$subVal : '';
                    } else {
                        $objValue = (!empty ($dataValue->$subVal)) ? $dataValue->$subVal : '';
                    }

                    $elementKey = ($elementKey) ? $elementKey : $subVal;
                } else {
                    $objValue = $dataValue;
                }

                $objValue = $this->getMultiReplacedValues ($elementKey, $objValue);
                if ($objValue != 'null' && $objValue) {
                    $htmlDisplay .= $sep . $this->escapeHtml ($objValue);
                    $count++;

                    $sep = ($count == $countData) ? $seperatorAnd : $seperator;
                }
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
    public function createRowValue ($valueArr, $separator)
    {

        $html = '';
        $sep = '';

        foreach ($valueArr as $rowLabel => $rowValue) {

            if ($rowValue != 'null' && trim ($rowValue) != '' && $rowValue) {

                $rowValue = $this->getMultiReplacedValues ($rowLabel, $rowValue);
                $html.= $sep . $rowValue;
                $sep = $separator;
            }
        }

        return $html;
    }

    /**
     * Add Social Plugin script
     * @author Altaf S
     * @param String $type Social Plugin Type
     * @param String $username Userid of social site
     *
     * @return String $icon script Row html
     *
     */
    public function addSocialPluginScript ($type, $username)
    {

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
                    $scriptContent = '<i class="fa fa-linkedin-square"></i><script src="//platform.linkedin.com/in.js" type="text/javascript"></script>
<script type="IN/MemberProfile" data-id="' . $username . '" data-format="click" data-related="true"></script>';
                    break;

                case 'skype' :
                    $scriptContent = '<i class="fa fa-skype"></i>
                                <script type="text/javascript" src="//www.skypeassets.com/i/scom/js/skype-uri.js"></script>
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
                    $fbUrl = 'http://www.facebook.com/' . $username;


                    $scriptContent = '<a title="View my Facebook Profile" target="_blank" href="' . $fbUrl . '"><i class="fa fa-facebook-square"></i></a>';
                    break;

                case 'twitterprofile' :
                    $twitterUserName = str_replace ("#", "", $username);
                    $twitterUrl = 'https://twitter.com/' . $twitterUserName;
                    $scriptContent = '<a title="View my Twitter Profile" target="_blank" href="' . $twitterUrl . '"><i class="fa fa-twitter-square"></i></a>';
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
    function recursive_isset ($variable, $checkArray, $i = 0)
    {

        $new_var = null;
        if (is_array ($variable) && array_key_exists ($checkArray[$i], $variable)) {
            $new_var = $variable[$checkArray[$i]];
        } else if (is_object ($variable) && array_key_exists ($checkArray[$i], $variable)) {
            $new_var = $variable->$checkArray[$i];
        }
        if (!isset ($new_var)) {
            return false;
        } else if (count ($checkArray) > $i + 1) {
            return $this->recursive_isset ($new_var, $checkArray, $i + 1);
        } else {
            return $new_var;
        }
    }


    /**
     * Given a string containing any combination of YouTube and Vimeo video URLs in
     * a variety of formats (iframe, shortened, etc), each separated by a line break,
     * parse the video string and determine it's valid embeddable URL for usage in
     * popular JavaScript lightbox plugins.
     *
     * In addition, this handler grabs both the maximize size and thumbnail versions
     * of video images for your general consumption. In the case of Vimeo, you must
     * have the ability to make remote calls using file_get_contents(), which may be
     * a problem on shared hosts.
     *
     * Data gets returned in the format:
     *
     * array(
     *   array(
     *     'url' => 'http://path.to/embeddable/video',
     *     'thumbnail' => 'http://path.to/thumbnail/image.jpg',
     *     'fullsize' => 'http://path.to/fullsize/image.jpg',
     *   )
     * )
     *
     * @param       string  $videoString
     * @return      array   An array of video metadata if found
     *
     * @author      Corey Ballou http://coreyballou.com
     * @copyright   (c) 2012 Skookum Digital Works http://skookum.com
     * @license
     */
    function parseVideos($videoString = null)
    {
        // return data
        $videos = array();

        if (!empty($videoString)) {

            // split on line breaks
            $videoString = stripslashes(trim($videoString));
            $videoString = explode("\n", $videoString);
            $videoString = array_filter($videoString, 'trim');
            // check each video for proper formatting
            foreach ($videoString as $video) {

                // check for iframe to get the video url
                if (strpos($video, 'iframe') !== FALSE) {
                    // retrieve the video url
                    $anchorRegex = '/src="(.*)?"/isU';
                    $results = array();
                    if (preg_match($anchorRegex, $video, $results)) {
                        $link = trim($results[1]);
                    }
                } else {
                    // we already have a url
                    $link = $video;
                }

                // if we have a URL, parse it down
                if (!empty($link)) {

                    // initial values
                    $video_id = NULL;
                    $videoIdRegex = NULL;
                    $results = array();
                    $videoIdRegex = '/(?:www.)?(vimeo|youtube).com\/(?:watch\?v=)?(.*?)(?:\z|&)/';

                    if ($videoIdRegex !== NULL) {
                        if (preg_match($videoIdRegex, $link, $results)) {
                            if ( in_array( "youtube", $results ) ) {
                                $video_str = 'http://www.youtube.com/v/%s?fs=1&amp;autoplay=1';
                                $videoPlayer = '<iframe src="//www.youtube.com/embed/%s" class="embed-responsive-item" frameborder="0" allowfullscreen></iframe>';
                                $thumbnail_str = 'http://img.youtube.com/vi/%s/2.jpg';
                                $fullsize_str = 'http://img.youtube.com/vi/%s/0.jpg';
                                $video_id = $results[2];
                            }
                            else if ( in_array( "vimeo", $results ) ) {
                                $video_id = $results[2];
                                try {
                                    $hash = unserialize(file_get_contents("http://vimeo.com/api/v2/video/$video_id.php"));
                                    if (!empty($hash) && is_array($hash)) {
                                        $video_str = 'http://vimeo.com/moogaloop.swf?clip_id=%s';
                                        $videoPlayer = '<iframe src="//player.vimeo.com/video/%s?title=0&amp;byline=0&amp;portrait=0" class="embed-responsive-item" frameborder="0"></iframe>';
                                        $thumbnail_str = $hash[0]['thumbnail_small'];
                                        $fullsize_str = $hash[0]['thumbnail_large'];
                                    } else {
                                        // don't use, couldn't find what we need
                                        unset($video_id);
                                    }
                                } catch (Exception $e) {
                                    unset($video_id);
                                }
                            }
                        }
                    }

                    // check if we have a video id, if so, add the video metadata
                    if (!empty($video_id)) {
                        // add to return
                        $videos[] = array(
                            'url' => sprintf($video_str, $video_id),
                            'videoplayer' => sprintf($videoPlayer, $video_id),
                            'thumbnail' => sprintf($thumbnail_str, $video_id),
                            'fullsize' => sprintf($fullsize_str, $video_id)
                        );
                    }
                }
            }
        }

        // return array of parsed videos
        return $videos;
    }

    /**
     * Set the zoom value of a map
     * @param float $reach The circle reach
     * @return float $zoom The zoom value
     */
    function setZoom ( $reach )
    {
        $zoom;
        $zoomRounded = round($reach);

        if ( $zoomRounded < 2)
        {
            $zoom = 12;
        }
        elseif ( $zoomRounded >= 2 && $zoomRounded <= 5 )
        {
            $zoom = 11;
        }
        elseif ( $zoomRounded >= 5 && $zoomRounded <= 20 )
        {
            $zoom = 10;
        }
        elseif ( $zoomRounded >= 20 && $zoomRounded <= 40 )
        {
            $zoom = 9;
        }
        elseif ( $zoomRounded >= 40 && $zoomRounded <= 80 )
        {
            $zoom = 8;
        }
        elseif ( $zoomRounded >= 80 && $zoomRounded <= 160 )
        {
            $zoom = 7;
        }
        elseif ( $zoomRounded >= 160 && $zoomRounded <= 320 )
        {
            $zoom = 6;
        }
        elseif ( $zoomRounded >= 320 && $zoomRounded <= 640 )
        {
            $zoom = 5;
        }
        elseif ( $zoomRounded >= 640 && $zoomRounded <= 1280 )
        {
            $zoom = 4;
        }
        elseif ( $zoomRounded >= 1280 && $zoomRounded <= 2560 )
        {
            $zoom = 3;
        }
        elseif ( $zoomRounded >= 2560 && $zoomRounded <= 5120 )
        {
            $zoom = 2;
        }
        else
        {
            $zoom = 1;
        }

        return $zoom;
    }


    /**
     * Validation function for nested objects
     * @param String $fileName File Name
     * @return String $audioVideoHtml Embed Video Html
     */
    function embedAudioVideo ($fileName, $width = '120', $height = '90')
    {
        $audioVideoHtml = "<object classid='clsid:22D6F312-B0F6-11D0-94AB-0080C74C7E95' width='$width' height='$height' codebase='http://www.microsoft.com/Windows/MediaPlayer/'>
                        <param name='Filename' value='$fileName'>
                        <param name='AutoStart' value='true'>
                        <param name='ShowControls' value='true'>
                        <param name='BufferingTime' value='2'>
                        <param name='ShowStatusBar' value='true'>
                        <param name='AutoSize' value='true'>
                        <param name='InvokeURLs' value='false'>
                        <embed src=''$fileName' type='application/x-mplayer2' autostart='1' enabled='1' showstatusbar='1' showdisplay='1' showcontrols='1' pluginspage='http://www.microsoft.com/Windows/MediaPlayer/' CODEBASE='http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,0,0,0' width='480' height='360'></embed>
                        </object>";

        return $audioVideoHtml;
    }

    /**
     * Validation function for nested objects
     * @param String $fileName File Name
     * @return String $audioVideoHtml Embed Video Html
     */
    function displayAudioVideo ($gridLabel, $gridValue, $rowValues, $properties = array ())
    {
        /** Class * */
        $classLabel = (isset ($properties['class_label']) && $properties['class_label']) ? " class = '" . $properties['class_label'] . "' " : '';
        $classValue = (isset ($properties['class_value']) && $properties['class_value']) ? " class = '" . $properties['class_value'] . "' " : '';

        /** Tag * */
        $tagLabel = (isset ($properties['tag_label']) && $properties['tag_label']) ? $properties['tag_label'] : 'div';
        $tagValue = (isset ($properties['tag_value']) && $properties['tag_value']) ? $properties['tag_value'] : 'div';

        $rowHtml = "<div class='row'>";
        $displayFlag = true;
        foreach ($rowValues as $value) {

            if ($displayFlag) {
                //Display Label
                $rowHtml .= "<div class='" . $gridLabel . "'>";
                $rowHtml .= "<$tagLabel " . $classLabel . " > " . $this->escapeHtml ($value) . " </$tagLabel>";
                $rowHtml .= "</div>";
                $displayFlag = false;
            } else {
                //Display Value
                $rowHtml .= "<div class='" . $gridValue . "'>";
                $rowHtml .= "<$tagValue " . $classValue . " > " . $this->escapeHtml ($value) . " </$tagValue>";
                $rowHtml .= "</div>";
                $displayFlag = true;
            }
        }
        $rowHtml .="</div>";
        return $rowHtml;
    }

    /**
     * Display Attachments.
     *
     * @author Altaf S
     *
     * @param string $header Html Header
     * @param array $attachment Array of attachment values
     *
     * @return string $html html display for attachments
     *
     * @access public
     */
    function displayAttachments ($header, $attachmentArr)
    {
        $html = NULL;
        $displayHeader = NULL;
        $returnHtml = '';
        if (!empty ($attachmentArr) && is_array ($attachmentArr)) {

            foreach ($attachmentArr as $attachment) {
                if (!empty ($attachment->document)) {
                    $date = date ('d F, Y', $attachment->uploadedDateTime);
                    $documentImage = preg_match ("/^image/i", $attachment->mimeType)
                                    ? '<img class="img-rounded documentImage" src="'.$attachment->document.'">'
                                    : '<i class="fa fa-file-text-o document-icon"></i>';

                    $html .= '<div class="row attachment"><div class="col-sm-3">';
                    $html .= "{$documentImage}";
                    $html .= '</div>';

                    $html .= '<div class="col-sm-9">';
                    $html .= "<strong class='documentName word-break'>" . $this->escapeHtml ($attachment->documentName) . "</strong>";
                    $html .= "<p>{$date} </p>";

                    if ($this->exst ($attachment->purpose)) {
                        $html .= "<p>" . $this->escapeHtml ($attachment->purpose) . "</p>";
                    }

                    $html .= '</div>';

                    $html .= '</div>';

                    $displayHeader = $header;
                }
            }



            $returnHtml = $displayHeader . $html;
        }
        return $returnHtml;
    }

    /**
     * Function exst() - Checks if the variable has been set
     *
     * If the variable is set and not empty returns the variable (no transformation)
     * If the variable is not set or empty, returns the $default value
     * @author Altaf S
     * @param  mixed $var
     * @param  mixed $default
     *
     * @return mixed
     */
    function exst (& $var, $default = null, $escape = true)
    {
        $var = ($escape && is_string ($var)) ? $this->escapeHtml ($var) : $var;
        return empty ($var) ? $var = $default : $var;
    }

    function addPrefixSuffix ( $data, $prefix = '', $suffix = '' )
    {
        $return = NULL;
        if ( $data )
        {
            $return = $prefix . $data . $suffix;
        }

        return $return;
    }

    function checkEmpty( $vars )
    {
        $hasValue = false;
        foreach ($vars as $var)
        {
            if ( $var != NULL || $var != "" )
            {
                $hasValue = true;
                break;
            }
        }

        return $hasValue;
    }

    function getBidxToken ($token)
    {
        $tokenVal = NULL;
        switch ($token) {

            case '{{community_name}}':
            case '{{group}}':

                if (isset (BidxCommon::$staticSession->data->currentGroup)) {
                    $currentGroupId = BidxCommon::$staticSession->data->currentGroup;
                    $tokenVal = (isset(BidxCommon::$staticSession->data->groups->$currentGroupId->name) )? BidxCommon::$staticSession->data->groups->$currentGroupId->name: 'Name not available';
                }

                break;
        }

        return $tokenVal;
    }

    /**
     * Validation function for nested objects
     * @author Altaf S
     * @param String $fileName File Name
     * @return String $audioVideoHtml Embed Video Html
     */
    function replaceMessageTokens ($body, $tokens = array ())
    {
        preg_match_all ("/{{(?:.*?)}}+/i", $body, $matches);


        foreach ($matches[0] as $match) {
            if (isset ($tokens[$match])) {
                $body = str_replace ($match, htmlspecialchars_decode($tokens[$match]), $body);
            } else {
                $tokenVal = $this->getBidxToken ($match);
                $body = str_replace ($match, htmlspecialchars_decode($tokenVal), $body);
            }
        }

        return $body;
    }

    /**
     * Escape Special Html Chars
     * @author Altaf S
     * @param String $htmlsanitize String
     * @return String $audioVideoHtml Returns special html chars
     */
    function escapeHtml ($htmlsanitize)
    {
        return htmlspecialchars ($htmlsanitize, ENT_NOQUOTES, 'UTF-8');
    }

    /**
     * Escape Speical Html Chars
     * @author Altaf S
     *
     * @return Print 404 Html defined by template
     */

    function return_404 ()
    {
        status_header (404);
        nocache_headers ();
        include( get_404_template () );
        exit;
    }

    function createLeftMenu($spanGrid, $menuLabelArr, $activeMenu = NULL)
    {

        $html = " <div class='{$spanGrid}' >
                    <ul class='nav nav-pills nav-stacked'>";

        foreach ($menuLabelArr as $menuLink => $menuLabel) {

            $menuClass = ($menuLabel == $activeMenu) ? ' active': '';
            $html .= " <li class='limenu {$menuLabel}{$menuClass}'><a href='{$menuLink}'>{$menuLabel}</a></li>";

        }

        $html .= "   </ul>
                  </div> ";

        return $html;
    }

}

?>
