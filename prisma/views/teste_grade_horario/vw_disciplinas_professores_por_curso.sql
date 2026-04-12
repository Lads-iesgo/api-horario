SELECT
  `c`.`idCurso` AS `idCurso`,
  `c`.`nomeCurso` AS `curso`,
  `d`.`idDisciplina` AS `idDisciplina`,
  `d`.`nomeDisciplina` AS `disciplina`,
  `d`.`modalidade` AS `modalidade`,
  `p`.`idProfessor` AS `idProfessor`,
  `p`.`nomeProfessor` AS `nomeProfessor`,
  `p`.`titulacao` AS `titulacao`
FROM
  (
    (
      (
        (
          `teste_grade_horario`.`curso_disciplina` `cd`
          JOIN `teste_grade_horario`.`curso` `c` ON((`cd`.`idCurso` = `c`.`idCurso`))
        )
        JOIN `teste_grade_horario`.`disciplina` `d` ON((`cd`.`idDisciplina` = `d`.`idDisciplina`))
      )
      JOIN `teste_grade_horario`.`disciplina_professor` `dp` ON((`dp`.`idDisciplina` = `d`.`idDisciplina`))
    )
    JOIN `teste_grade_horario`.`professor` `p` ON((`dp`.`idProfessor` = `p`.`idProfessor`))
  )
UNION
ALL
SELECT
  `c`.`idCurso` AS `idCurso`,
  `c`.`nomeCurso` AS `curso`,
  `d`.`idDisciplina` AS `idDisciplina`,
  `d`.`nomeDisciplina` AS `disciplina`,
  `d`.`modalidade` AS `modalidade`,
  `p`.`idProfessor` AS `idProfessor`,
  `p`.`nomeProfessor` AS `nomeProfessor`,
  `p`.`titulacao` AS `titulacao`
FROM
  (
    (
      (
        `teste_grade_horario`.`curso_disciplina` `cd`
        JOIN `teste_grade_horario`.`curso` `c` ON((`cd`.`idCurso` = `c`.`idCurso`))
      )
      JOIN `teste_grade_horario`.`disciplina` `d` ON((`cd`.`idDisciplina` = `d`.`idDisciplina`))
    )
    JOIN `teste_grade_horario`.`professor` `p`
  )
WHERE
  (`p`.`idProfessor` IN (1, 2))
ORDER BY
  `curso`,
  `disciplina`,
  `nomeProfessor`